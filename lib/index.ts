/* eslint-disable require-atomic-updates */

import assert from 'assert';
import {
  existsSync,
  mkdirp,
  readFile,
  remove,
  stat,
  readFileSync,
  writeFileSync,
  copyFileSync,
} from 'fs-extra';
import minimist from 'minimist';
import { need, system } from 'pkg-fetch';
import path from 'path';

import { log, wasReported } from './log';
import help from './help';
import { isPackageJson } from './common';
import packer from './packer';
import { plusx } from './chmod';
import producer from './producer';
import refine from './refiner';
import { shutdown } from './fabricator';
import walk, { Marker, WalkerParams } from './walker';
import { Target, NodeTarget, SymLinks } from './types';
import { CompressType } from './compress_type';
import { patchMachOExecutable, signMachOExecutable } from './mach-o';

const { version } = JSON.parse(
  readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
);

function isConfiguration(file: string) {
  return isPackageJson(file) || file.endsWith('.config.json');
}

// http://www.openwall.com/lists/musl/2012/12/08/4

const {
  hostArch,
  hostPlatform,
  isValidNodeRange,
  knownArchs,
  knownPlatforms,
  toFancyArch,
  toFancyPlatform,
} = system;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const hostNodeRange = `node${process.version.match(/^v(\d+)/)![1]}`;

function parseTargets(items: string[]): NodeTarget[] {
  // [ 'node6-macos-x64', 'node6-linux-x64' ]
  const targets: NodeTarget[] = [];

  for (const item of items) {
    const target = {
      nodeRange: hostNodeRange,
      platform: hostPlatform,
      arch: hostArch,
    };

    if (item !== 'host') {
      for (const token of item.split('-')) {
        if (!token) {
          continue;
        }

        if (isValidNodeRange(token)) {
          target.nodeRange = token;
          continue;
        }

        const p = toFancyPlatform(token);

        if (knownPlatforms.indexOf(p) >= 0) {
          target.platform = p;
          continue;
        }
        const a = toFancyArch(token);

        if (knownArchs.indexOf(a) >= 0) {
          target.arch = a;
          continue;
        }

        throw wasReported(`Unknown token '${token}' in '${item}'`);
      }
    }

    targets.push(target as NodeTarget);
  }

  return targets;
}

function stringifyTarget(target: NodeTarget) {
  const { nodeRange, platform, arch } = target;
  return `${nodeRange}-${platform}-${arch}`;
}

interface DifferentResult {
  nodeRange?: boolean;
  platform?: boolean;
  arch?: boolean;
}

function differentParts(targets: NodeTarget[]): DifferentResult {
  const nodeRanges: Record<string, boolean> = {};
  const platforms: Record<string, boolean> = {};
  const archs: Record<string, boolean> = {};

  for (const target of targets) {
    nodeRanges[target.nodeRange] = true;
    platforms[target.platform] = true;
    archs[target.arch] = true;
  }

  const result: DifferentResult = {};

  if (Object.keys(nodeRanges).length > 1) {
    result.nodeRange = true;
  }

  if (Object.keys(platforms).length > 1) {
    result.platform = true;
  }

  if (Object.keys(archs).length > 1) {
    result.arch = true;
  }

  return result;
}

function stringifyTargetForOutput(
  output: string,
  target: NodeTarget,
  different: DifferentResult
) {
  const a = [output];

  if (different.nodeRange) {
    a.push(target.nodeRange);
  }

  if (different.platform) {
    a.push(target.platform);
  }

  if (different.arch) {
    a.push(target.arch);
  }

  return a.join('-');
}

function fabricatorForTarget({ nodeRange, arch }: NodeTarget) {
  let fabPlatform = hostPlatform;

  if (
    hostArch !== arch &&
    (hostPlatform === 'linux' || hostPlatform === 'alpine')
  ) {
    // With linuxstatic, it is possible to generate bytecode for different
    // arch with simple QEMU configuration instead of the entire sysroot.
    fabPlatform = 'linuxstatic';
  }

  return {
    nodeRange,
    platform: fabPlatform,
    arch,
  };
}

const dryRunResults: Record<string, boolean> = {};

async function needWithDryRun({
  forceBuild,
  nodeRange,
  platform,
  arch,
}: NodeTarget) {
  const result = await need({
    dryRun: true,
    forceBuild,
    nodeRange,
    platform,
    arch,
  });
  assert(['exists', 'fetched', 'built'].indexOf(result) >= 0);
  dryRunResults[result] = true;
}

const targetsCache: Record<string, string> = {};

async function needViaCache(target: NodeTarget) {
  const s = stringifyTarget(target);
  let c = targetsCache[s];

  if (c) {
    return c;
  }

  const { forceBuild, nodeRange, platform, arch } = target;

  c = await need({
    forceBuild,
    nodeRange,
    platform,
    arch,
  });

  targetsCache[s] = c;

  return c;
}

export async function exec(argv2: string[]) {
  // eslint-disable-line complexity
  const argv = minimist(argv2, {
    boolean: [
      'b',
      'build',
      'bytecode',
      'native-build',
      'd',
      'debug',
      'h',
      'help',
      'public',
      'v',
      'version',
    ],
    string: [
      '_',
      'c',
      'config',
      'o',
      'options',
      'output',
      'outdir',
      'out-dir',
      'out-path',
      'public-packages',
      'no-dict',
      't',
      'target',
      'targets',
      'C',
      'compress',
    ],
    default: { bytecode: true, 'native-build': true },
  });

  if (argv.h || argv.help) {
    help();
    return;
  }

  // version

  if (argv.v || argv.version) {
    // eslint-disable-next-line no-console
    console.log(version);
    return;
  }

  log.info(`pkg@${version}`);

  // debug

  log.debugMode = argv.d || argv.debug;

  // forceBuild

  const forceBuild = argv.b || argv.build;

  // doCompress
  const algo = argv.C || argv.compress || 'None';

  let doCompress: CompressType = CompressType.None;
  switch (algo.toLowerCase()) {
    case 'brotli':
    case 'br':
      doCompress = CompressType.Brotli;
      break;
    case 'gzip':
    case 'gz':
      doCompress = CompressType.GZip;
      break;
    case 'none':
      break;
    default:
      // eslint-disable-next-line no-console
      throw wasReported(
        `Invalid compression algorithm ${algo} ( should be None, Brotli or Gzip)`
      );
  }
  if (doCompress !== CompressType.None) {
    // eslint-disable-next-line no-console
    console.log('compression: ', CompressType[doCompress]);
  }

  // _

  if (!argv._.length) {
    throw wasReported('Entry file/directory is expected', [
      'Pass --help to see usage information',
    ]);
  }

  if (argv._.length > 1) {
    throw wasReported('Not more than one entry file/directory is expected');
  }

  // input

  let input = path.resolve(argv._[0]);

  if (!existsSync(input)) {
    throw wasReported('Input file does not exist', [input]);
  }

  if ((await stat(input)).isDirectory()) {
    input = path.join(input, 'package.json');
    if (!existsSync(input)) {
      throw wasReported('Input file does not exist', [input]);
    }
  }

  // inputJson

  let inputJson;
  let inputJsonName;

  if (isConfiguration(input)) {
    inputJson = JSON.parse(await readFile(input, 'utf-8'));
    inputJsonName = inputJson.name;

    if (inputJsonName) {
      inputJsonName = inputJsonName.split('/').pop(); // @org/foo
    }
  }

  // inputBin

  let inputBin;

  if (inputJson) {
    let { bin } = inputJson;

    if (bin) {
      if (typeof bin === 'object') {
        if (bin[inputJsonName]) {
          bin = bin[inputJsonName];
        } else {
          bin = bin[Object.keys(bin)[0]]; // TODO multiple inputs to pkg them all?
        }
      }
      inputBin = path.resolve(path.dirname(input), bin);
      if (!existsSync(inputBin)) {
        throw wasReported(
          'Bin file does not exist (taken from package.json ' +
            "'bin' property)",
          [inputBin]
        );
      }
    }
  }

  if (inputJson && !inputBin) {
    throw wasReported("Property 'bin' does not exist in", [input]);
  }

  // inputFin

  const inputFin = inputBin || input;

  // config

  let config = argv.c || argv.config;

  if (inputJson && config) {
    throw wasReported("Specify either 'package.json' or config. Not both");
  }

  // configJson

  let configJson;

  if (config) {
    config = path.resolve(config);
    if (!existsSync(config)) {
      throw wasReported('Config file does not exist', [config]);
    }

    // eslint-disable-next-line import/no-dynamic-require, global-require
    configJson = require(config); // may be either json or js

    if (
      !configJson.name &&
      !configJson.files &&
      !configJson.dependencies &&
      !configJson.pkg
    ) {
      // package.json not detected
      configJson = { pkg: configJson };
    }
  }

  // output, outputPath

  let output = argv.o || argv.output;
  let outputPath = argv['out-path'] || argv.outdir || argv['out-dir'];
  let autoOutput = false;

  if (output && outputPath) {
    throw wasReported("Specify either 'output' or 'out-path'. Not both");
  }

  if (!output) {
    let name;

    if (inputJson) {
      name = inputJsonName;

      if (!name) {
        throw wasReported("Property 'name' does not exist in", [argv._[0]]);
      }
    } else if (configJson) {
      name = configJson.name;
    }

    if (!name) {
      name = path.basename(inputFin);
    }

    if (!outputPath) {
      if (inputJson && inputJson.pkg) {
        outputPath = inputJson.pkg.outputPath;
      } else if (configJson && configJson.pkg) {
        outputPath = configJson.pkg.outputPath;
      }

      outputPath = outputPath || '';
    }

    autoOutput = true;
    const ext = path.extname(name);
    output = name.slice(0, -ext.length || undefined);
    output = path.resolve(outputPath || '', output);
  } else {
    output = path.resolve(output);
  }

  // targets

  const sTargets = argv.t || argv.target || argv.targets || '';

  if (typeof sTargets !== 'string') {
    throw wasReported(`Something is wrong near ${JSON.stringify(sTargets)}`);
  }

  let targets = parseTargets(
    sTargets.split(',').filter((t) => t)
  ) as unknown as Array<NodeTarget & Partial<Target>>;

  if (!targets.length) {
    let jsonTargets;

    if (inputJson && inputJson.pkg) {
      jsonTargets = inputJson.pkg.targets;
    } else if (configJson && configJson.pkg) {
      jsonTargets = configJson.pkg.targets;
    }

    if (jsonTargets) {
      targets = parseTargets(jsonTargets);
    }
  }

  if (!targets.length) {
    if (!autoOutput) {
      targets = parseTargets(['host']);
      assert(targets.length === 1);
    } else {
      targets = parseTargets(['linux', 'macos', 'win']);
    }

    log.info(
      'Targets not specified. Assuming:',
      `${targets.map((t) => stringifyTarget(t)).join(', ')}`
    );
  }

  // differentParts

  const different = differentParts(targets);

  // targets[].output

  for (const target of targets) {
    let file;

    if (targets.length === 1) {
      file = output;
    } else {
      file = stringifyTargetForOutput(output, target, different);
    }

    if (target.platform === 'win' && path.extname(file) !== '.exe') {
      file += '.exe';
    }

    target.output = file;
  }

  // bakes

  const bakes = ((argv.options || '') as string)
    .split(',')
    .filter((bake) => bake)
    .map((bake) => `--${bake}`);

  // check if input is going
  // to be overwritten by output

  for (const target of targets) {
    if (target.output === inputFin) {
      if (autoOutput) {
        target.output += `-${target.platform}`;
      } else {
        throw wasReported('Refusing to overwrite input file', [inputFin]);
      }
    }
  }

  // fetch targets

  const { bytecode } = argv;

  const nativeBuild = argv['native-build']

  for (const target of targets) {
    target.forceBuild = forceBuild;

    await needWithDryRun(target);

    target.fabricator = fabricatorForTarget(target) as Target;

    if (bytecode) {
      await needWithDryRun({
        ...target.fabricator,
        forceBuild,
      });
    }
  }

  if (dryRunResults.fetched && !dryRunResults.built) {
    log.info('Fetching base Node.js binaries to PKG_CACHE_PATH');
  }

  for (const target of targets) {
    target.binaryPath = await needViaCache(target);
    const f = target.fabricator;

    if (f && bytecode) {
      f.binaryPath = await needViaCache(f as NodeTarget);

      if (f.platform === 'macos') {
        // ad-hoc sign the base binary temporarily to generate bytecode
        // due to the new mandatory signing requirement
        const signedBinaryPath = `${f.binaryPath}-signed`;
        await remove(signedBinaryPath);
        copyFileSync(f.binaryPath, signedBinaryPath);
        try {
          signMachOExecutable(signedBinaryPath);
        } catch {
          throw wasReported('Cannot generate bytecode', [
            'pkg fails to run "codesign" utility. Due to the mandatory signing',
            'requirement of macOS, executables must be signed. Please ensure the',
            'utility is installed and properly configured.',
          ]);
        }
        f.binaryPath = signedBinaryPath;
      }

      if (f.platform !== 'win') {
        await plusx(f.binaryPath);
      }
    }
  }

  // marker

  let marker: Marker;

  if (configJson) {
    marker = {
      config: configJson,
      base: path.dirname(config),
      configPath: config,
    };
  } else {
    marker = {
      config: inputJson || {}, // not `inputBin` because only `input`
      base: path.dirname(input), // is the place for `inputJson`
      configPath: input,
    };
  }

  marker.toplevel = true;

  // public

  const params: WalkerParams = {};

  if (argv.public) {
    params.publicToplevel = true;
  }

  if (argv['public-packages']) {
    params.publicPackages = argv['public-packages'].split(',');

    if (params.publicPackages?.indexOf('*') !== -1) {
      params.publicPackages = ['*'];
    }
  }

  if (argv['no-dict']) {
    params.noDictionary = argv['no-dict'].split(',');

    if (params.noDictionary?.indexOf('*') !== -1) {
      params.noDictionary = ['*'];
    }
  }

  // records

  let records;
  let entrypoint = inputFin;
  let symLinks: SymLinks;
  const addition = isConfiguration(input) ? input : undefined;

  const walkResult = await walk(marker, entrypoint, addition, params);
  entrypoint = walkResult.entrypoint;

  records = walkResult.records;
  symLinks = walkResult.symLinks;

  const refineResult = refine(records, entrypoint, symLinks);
  entrypoint = refineResult.entrypoint;
  records = refineResult.records;
  symLinks = refineResult.symLinks;

  const backpack = packer({ records, entrypoint, bytecode, symLinks });

  log.debug('Targets:', JSON.stringify(targets, null, 2));

  for (const target of targets) {
    if (target.output && existsSync(target.output)) {
      if ((await stat(target.output)).isFile()) {
        await remove(target.output);
      } else {
        throw wasReported('Refusing to overwrite non-file output', [
          target.output,
        ]);
      }
    } else if (target.output) {
      await mkdirp(path.dirname(target.output));
    }

    await producer({
      backpack,
      bakes,
      slash: target.platform === 'win' ? '\\' : '/',
      target: target as Target,
      symLinks,
      doCompress,
      nativeBuild,
      mockNode: process.env.MOCK_NODE !== 'false'
    });

    if (target.platform !== 'win' && target.output) {
      if (target.platform === 'macos') {
        // patch executable to allow code signing
        const buf = patchMachOExecutable(readFileSync(target.output));
        writeFileSync(target.output, buf);

        try {
          // sign executable ad-hoc to workaround the new mandatory signing requirement
          // users can always replace the signature if necessary
          signMachOExecutable(target.output);
        } catch {
          if (target.arch === 'arm64') {
            log.warn('Unable to sign the macOS executable', [
              'Due to the mandatory code signing requirement, before the',
              'executable is distributed to end users, it must be signed.',
              'Otherwise, it will be immediately killed by kernel on launch.',
              'An ad-hoc signature is sufficient.',
              'To do that, run pkg on a Mac, or transfer the executable to a Mac',
              'and run "codesign --sign - <executable>", or (if you use Linux)',
              'install "ldid" utility to PATH and then run pkg again',
            ]);
          }
        }
      }

      await plusx(target.output);
    }
  }

  shutdown();
}
