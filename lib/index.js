import { exists, mkdirp, readFile, remove, stat } from 'fs-extra';
import { log, wasReported } from './log.js';
import { need, system } from 'pkg-fetch';
import assert from 'assert';
import help from './help';
import { isPackageJson } from '../prelude/common.js';
import minimist from 'minimist';
import packer from './packer.js';
import path from 'path';
import { plusx } from './chmod.js';
import producer from './producer.js';
import refine from './refiner.js';
import { shutdown } from './fabricator.js';
import { version } from '../package.json';
import walk from './walker.js';

function isConfiguration (file) {
  return isPackageJson(file) || file.endsWith('.config.json');
}

// http://www.openwall.com/lists/musl/2012/12/08/4

const { hostArch, hostPlatform, isValidNodeRange, knownArchs,
  knownPlatforms, toFancyArch, toFancyPlatform } = system;
const hostNodeRange = 'node' + process.version.match(/^v(\d+)/)[1];

function parseTargets (items) {
  // [ 'node6-macos-x64', 'node6-linux-x64' ]
  const targets = [];
  for (const item of items) {
    const target = {
      nodeRange: hostNodeRange,
      platform: hostPlatform,
      arch: hostArch
    };
    if (item !== 'host') {
      for (const token of item.split('-')) {
        if (!token) continue;
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
    targets.push(target);
  }
  return targets;
}

function stringifyTarget (target) {
  const { nodeRange, platform, arch } = target;
  return `${nodeRange}-${platform}-${arch}`;
}

function differentParts (targets) {
  const nodeRanges = {};
  const platforms = {};
  const archs = {};
  for (const target of targets) {
    nodeRanges[target.nodeRange] = true;
    platforms[target.platform] = true;
    archs[target.arch] = true;
  }
  const result = {};
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

function stringifyTargetForOutput (output, target, different) {
  const a = [ output ];
  if (different.nodeRange) a.push(target.nodeRange);
  if (different.platform) a.push(target.platform);
  if (different.arch) a.push(target.arch);
  return a.join('-');
}

function fabricatorForTarget (target) {
  const { nodeRange, arch } = target;
  return { nodeRange, platform: hostPlatform, arch };
}

const dryRunResults = {};

async function needWithDryRun (target) {
  const target2 = Object.assign({ dryRun: true }, target);
  const result = await need(target2);
  assert([ 'exists', 'fetched', 'built' ].indexOf(result) >= 0);
  dryRunResults[result] = true;
}

const targetsCache = {};

async function needViaCache (target) {
  const s = stringifyTarget(target);
  let c = targetsCache[s];
  if (c) return c;
  c = await need(target);
  targetsCache[s] = c;
  return c;
}

export async function exec (argv2) { // eslint-disable-line complexity
  const argv = minimist(argv2, {
    boolean: [ 'b', 'build', 'bytecode', 'd', 'debug',
      'h', 'help', 'public', 'v', 'version' ],
    string: [ '_', 'c', 'config', 'o', 'options', 'output',
      'outdir', 'out-dir', 'out-path', 't', 'target', 'targets' ],
    default: { bytecode: true }
  });

  if (argv.h || argv.help) {
    help();
    return;
  }

  // version

  if (argv.v || argv.version) {
    console.log(version);
    return;
  }

  log.info(`pkg@${version}`);

  // debug

  log.debugMode = argv.d || argv.debug;

  // forceBuild

  const forceBuild = argv.b || argv.build;

  // _

  if (!argv._.length) {
    throw wasReported('Entry file/directory is expected', [
      'Pass --help to see usage information' ]);
  }
  if (argv._.length > 1) {
    throw wasReported('Not more than one entry file/directory is expected');
  }

  // input

  let input = path.resolve(argv._[0]);

  if (!await exists(input)) {
    throw wasReported('Input file does not exist', [ input ]);
  }
  if ((await stat(input)).isDirectory()) {
    input = path.join(input, 'package.json');
    if (!await exists(input)) {
      throw wasReported('Input file does not exist', [ input ]);
    }
  }

  // inputJson

  let inputJson, inputJsonName;

  if (isConfiguration(input)) {
    inputJson = JSON.parse(await readFile(input));
    inputJsonName = inputJson.name;
    if (inputJsonName) {
      inputJsonName = inputJsonName.split('/').pop(); // @org/foo
    }
  }

  // inputBin

  let inputBin;

  if (inputJson) {
    let bin = inputJson.bin;
    if (bin) {
      if (typeof bin === 'object') {
        if (bin[inputJsonName]) {
          bin = bin[inputJsonName];
        } else {
          bin = bin[Object.keys(bin)[0]]; // TODO multiple inputs to pkg them all?
        }
      }
      inputBin = path.resolve(path.dirname(input), bin);
      if (!await exists(inputBin)) {
        throw wasReported('Bin file does not exist (taken from package.json ' +
          '\'bin\' property)', [ inputBin ]);
      }
    }
  }

  if (inputJson && !inputBin) {
    throw wasReported('Property \'bin\' does not exist in', [ input ]);
  }

  // inputFin

  const inputFin = inputBin || input;

  // config

  let config = argv.c || argv.config;

  if (inputJson && config) {
    throw wasReported('Specify either \'package.json\' or config. Not both');
  }

  // configJson

  let configJson;

  if (config) {
    config = path.resolve(config);
    if (!await exists(config)) {
      throw wasReported('Config file does not exist', [ config ]);
    }
    configJson = require(config); // may be either json or js
    if (!configJson.name && !configJson.files &&
        !configJson.dependencies && !configJson.pkg) { // package.json not detected
      configJson = { pkg: configJson };
    }
  }

  // output, outputPath

  let output = argv.o || argv.output;
  const outputPath = argv['out-path'] || argv.outdir || argv['out-dir'];
  let autoOutput = false;

  if (output && outputPath) {
    throw wasReported('Specify either \'output\' or \'out-path\'. Not both');
  }

  if (!output) {
    let name;
    if (inputJson) {
      name = inputJsonName;
      if (!name) {
        throw wasReported('Property \'name\' does not exist in', [ argv._[0] ]);
      }
    } else
    if (configJson) {
      name = configJson.name;
    }
    if (!name) {
      name = path.basename(inputFin);
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
  );

  if (!targets.length) {
    let jsonTargets;
    if (inputJson && inputJson.pkg) {
      jsonTargets = inputJson.pkg.targets;
    } else
    if (configJson && configJson.pkg) {
      jsonTargets = configJson.pkg.targets;
    }
    if (jsonTargets) {
      targets = parseTargets(jsonTargets);
    }
  }

  if (!targets.length) {
    if (!autoOutput) {
      targets = parseTargets([ 'host' ]);
      assert(targets.length === 1);
    } else {
      targets = parseTargets([ 'linux', 'macos', 'win' ]);
    }
    log.info('Targets not specified. Assuming:',
      `${targets.map(stringifyTarget).join(', ')}`);
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
    if (target.platform === 'win' &&
        path.extname(file) !== '.exe') file += '.exe';
    target.output = file;
  }

  // bakes

  const bakes = (argv.options || '').split(',')
    .filter((bake) => bake).map((bake) => '--' + bake);

  // check if input is going
  // to be overwritten by output

  for (const target of targets) {
    if (target.output === inputFin) {
      if (autoOutput) {
        target.output += '-' + target.platform;
      } else {
        throw wasReported('Refusing to overwrite input file', [ inputFin ]);
      }
    }
  }

  // fetch targets

  const { bytecode } = argv;

  for (const target of targets) {
    target.forceBuild = forceBuild;
    await needWithDryRun(target);
    const f = target.fabricator = fabricatorForTarget(target);
    f.forceBuild = forceBuild;
    if (bytecode) {
      await needWithDryRun(f);
    }
  }

  if (dryRunResults.fetched && !dryRunResults.built) {
    log.info('Fetching base Node.js binaries to PKG_CACHE_PATH');
  }

  for (const target of targets) {
    target.binaryPath = await needViaCache(target);
    const f = target.fabricator;
    if (bytecode) {
      f.binaryPath = await needViaCache(f);
      if (f.platform !== 'win') {
        await plusx(f.binaryPath);
      }
    }
  }

  // marker

  let marker;

  if (configJson) {
    marker = {
      config: configJson,
      base: path.dirname(config)
    };
  } else {
    marker = {
      config: inputJson || {},  // not `inputBin` because only `input`
      base: path.dirname(input) // is the place for `inputJson`
    };
  }

  // public

  if (argv.public) {
    marker.config.license = 'public domain';
  }

  // records

  let records;
  let entrypoint = inputFin;
  const addition = isConfiguration(input) ? input : undefined;

  const walkResult = await walk(marker, entrypoint, addition);
  entrypoint = walkResult.entrypoint;
  records = walkResult.records;

  const refineResult = refine(records, entrypoint);
  entrypoint = refineResult.entrypoint;
  records = refineResult.records;

  const backpack = packer({ records, entrypoint, bytecode });

  log.debug('Targets:', JSON.stringify(targets, null, 2));

  for (const target of targets) {
    if (await exists(target.output)) {
      if ((await stat(target.output)).isFile()) {
        await remove(target.output);
      } else {
        throw wasReported('Refusing to overwrite non-file output', [ target.output ]);
      }
    } else {
      await mkdirp(path.dirname(target.output));
    }

    const slash = target.platform === 'win' ? '\\' : '/';
    await producer({ backpack, bakes, slash, target });
    if (target.platform !== 'win') {
      await plusx(target.output);
    }
  }

  shutdown();
}
