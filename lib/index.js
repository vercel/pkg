import { exists, readFile, stat, writeFile } from 'fs-promise';
import { log, wasReported } from './log.js';
import { need, system } from 'pkg-fetch';
import assert from 'assert';
import help from './help';
import { isPackageJson } from '../runtime/common.js';
import minimist from 'minimist';
import packer from './packer.js';
import path from 'path';
import { plusx } from './chmod.js';
import producer from './producer.js';
import walker from './walker.js';

const { hostArch, hostPlatform, knownArchs,
  knownPlatforms, toFancyArch, toFancyPlatform } = system;
const hostNodeRange = 'node' + process.version[1];

function parseTarget (items) {
  // v6-osx-x64,v6-linux-x64
  if (!items) return [];
  const targets = [];
  for (const item of items.split(',')) {
    const target = {
      nodeRange: hostNodeRange,
      platform: hostPlatform,
      arch: hostArch
    };
    for (const token of item.split('-')) {
      if (!token) continue;
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
      target.nodeRange = token;
    }
    targets.push(target);
  }
  return targets;
}

function stringifyTarget (target) {
  const { nodeRange, platform, arch } = target;
  return `${nodeRange}-${platform}-${arch}`;
}

function fabricatorForTarget (target) {
  const { nodeRange } = target;
  return { nodeRange, platform: hostPlatform, arch: hostArch };
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
    boolean: [ 'b', 'build', 'd', 'debug', 'h', 'help' ],
    string: [ '_', 'c', 'config', 'o',
      'output', 't', 'target', 'targets' ]
  });

  if (argv.h || argv.help) {
    help();
    return;
  }

  // debug

  const debug = argv.d || argv.debug;
  log.debugMode = debug;

  // forceBuild

  const forceBuild = argv.b || argv.build;

  // _

  if (!argv._.length) {
    throw wasReported('At least one input file/directory is expected', [
      'Pass --help to see usage information' ]);
  }
  if (argv._.length > 1) {
    throw wasReported('Not more than one input file/directory is expected');
  }

  // input

  let input = path.resolve(argv._[0]);

  if (!await exists(input)) {
    throw wasReported(`Input file ${input} does not exist`);
  }
  if ((await stat(input)).isDirectory()) {
    input = path.join(input, 'package.json');
    if (!await exists(input)) {
      throw wasReported(`Input file ${input} does not exist`);
    }
  }

  // inputJson

  let inputJson = null;

  if (isPackageJson(input)) {
    inputJson = JSON.parse(await readFile(input));
  }

  // inputBin

  let inputBin = null;

  if (inputJson) {
    let bin = inputJson.bin;
    if (bin) {
      if (typeof bin === 'object') {
        if (bin[inputJson.name]) {
          bin = bin[inputJson.name];
        } else {
          bin = bin[Object.keys(bin)[0]]; // TODO multiple inputs to compile them all?
        }
      }
      inputBin = path.resolve(path.dirname(input), bin);
      if (!await exists(inputBin)) {
        throw wasReported(`Package.json bin entry ${inputBin} does not exist`);
      }
    }
  }

  // inputFin

  const inputFin = inputBin || input;

  // config

  let config = argv.c || argv.config;

  if (inputJson && config) {
    throw wasReported('Specify either \'package.json\' or config. Not both');
  }

  // configJson

  let configJson = null;

  if (config) {
    config = path.resolve(config);
    if (!await exists(config)) {
      throw wasReported(`Config file ${config} does not exist`);
    }
    configJson = require(config); // may be either json or js
    if (!configJson.name && !configJson.files &&
        !configJson.dependencies) { // package.json not detected
      configJson = { pkgConfig: configJson };
    }
  }

  // output

  let output = argv.o || argv.output;
  let autoOutput = false;

  if (!output) {
    const name = inputJson ? inputJson.name : path.basename(inputFin);
    const ext = path.extname(name);
    output = name.slice(0, -ext.length || undefined);
    output = path.join(path.dirname(input), name);
    autoOutput = true;
  }

  // targets

  let targets = parseTarget(argv.t || argv.target || argv.targets);

  if (!targets.length) {
    if (!autoOutput) {
      targets = parseTarget('-');
      assert(targets.length === 1);
    } else {
      targets = parseTarget('linux,osx,win');
    }
    log.info('Targets not specified. Assuming:',
      `${targets.map(stringifyTarget).join(', ')}`);
  }

  for (const target of targets) {
    target.forceBuild = forceBuild;
    target.binaryPath = await needViaCache(target);
    const f = target.fabricator = fabricatorForTarget(target);
    f.forceBuild = forceBuild;
    f.binaryPath = await needViaCache(f);
    if (f.platform !== 'win') {
      await plusx(f.binaryPath);
    }
  }

  if (targets.length === 1) {
    const target = targets[0];
    let file = output;
    if (target.platform === 'win' && autoOutput) file += '.exe';
    target.output = file;
  } else {
    for (const target of targets) {
      let file = `${output}-${stringifyTarget(target)}`;
      if (target.platform === 'win') file += '.exe';
      target.output = file;
    }
  }

  // tuple

  let tuple;

  if (configJson) {
    tuple = {
      config: configJson,
      base: path.dirname(config)
    };
  } else {
    tuple = {
      config: inputJson || {},
      base: path.dirname(input) // not `inputBin` because only `input`
    };                          // is the place for `inputJson`
  }

  // records

  const records = await walker({
    tuple, input: inputFin
  });

  // TODO memory consuming! when streams?
  const stripes = {};

  for (const target of targets) {
    const slash = target.platform === 'win' ? '\\' : '/';
    target.slash = slash;
    if (!stripes[slash]) {
      // TODO infos are shown twice for each slash. fix it once
      stripes[slash] = await packer({ records, slash });
    }
  }

  for (const target of targets) {
    const buffer = await producer({
      stripe: stripes[target.slash],
      fabricatorName: target.fabricator.binaryPath,
      houseName: target.binaryPath
    });
    await writeFile(target.output, buffer);
    if (target.platform !== 'win') {
      await plusx(target.output);
    }
  }

}
