import { exists, readFile, stat, writeFile } from 'fs-promise';
import { need, system } from 'pkg-cache';
import assert from 'assert';
import { isPackageJson } from '../runtime/common.js';
import { log } from './log.js';
import minimist from 'minimist';
import packer from './packer.js';
import path from 'path';
import { plusx } from './chmod.js';
import producer from './producer.js';
import reporter from './reporter.js';
import walker from './walker.js';

const { hostArch, hostPlatform, knownArchs,
  knownPlatforms, toFancyArch, toFancyPlatform } = system;
const hostNodeRange = 'v' + process.version[1];

function parse (items) {
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

function humanize (target) {
  const { nodeRange, platform, arch } = target;
  return `${nodeRange}-${platform}-${arch}`;
}

function fabricatorForTarget (target) {
  const { nodeRange } = target;
  return { nodeRange, platform: hostPlatform, arch: hostArch };
}

export async function exec (argv2) { // eslint-disable-line complexity

  const argv = minimist(argv2, {
    string: [ '_', 'c', 'config', 'l', 'loglevel', 'o',
      'output', 't', 'target', 'targets' ]
  });

  // loglevel

  const loglevel = argv.l || argv.loglevel;

  if (loglevel) {
    if (!reporter.isCorrectLevel(loglevel)) {
      throw new Error('Incorrect loglevel: ' + loglevel);
    }
    reporter.level = loglevel;
  }

  // _

  if (argv._.length > 1) {
    throw new Error('Not more than one input file/directory is expected');
  }
  if (!argv._.length) {
    throw new Error('At least one input file/directory is expected');
  }

  // input

  let input = path.resolve(argv._[0]);

  if (!await exists(input)) {
    throw new Error(`Input ${input} does not exist`);
  }
  if ((await stat(input)).isDirectory()) {
    input = path.join(input, 'package.json');
    if (!await exists(input)) {
      throw new Error(`Input ${input} does not exist`);
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
        throw new Error(`Package.json bin entry ${inputBin} does not exist`);
      }
    }
  }

  // inputFin

  const inputFin = inputBin || input;

  // config

  let config = argv.c || argv.config;

  if (inputJson && config) {
    throw new Error('Specify either \'package.json\' or config. Not both');
  }

  // configJson

  let configJson = null;

  if (config) {
    config = path.resolve(config);
    if (!await exists(config)) {
      throw new Error(`Config file ${config} does not exist`);
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
    const ext = path.extname(inputFin);
    output = inputFin.slice(0, -ext.length);
    autoOutput = true;
  }

  // targets

  let targets = parse(argv.t || argv.target || argv.targets);

  if (!targets.length) {
    if (output) {
      targets = parse('-');
      assert(targets.length === 1);
    } else {
      targets = parse('linux,osx,win');
    }
    log.warn('Targets not specified. ' +
      `Assuming ${targets.map(humanize).join(', ')}`);
  }

  for (const target of targets) {
    target.binaryPath = await need(target);
    const f = target.fabricator = fabricatorForTarget(target);
    f.binaryPath = await need(f);
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
      let file = `${output}-${humanize(target)}`;
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
