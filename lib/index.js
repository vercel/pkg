import { need, system } from 'pkg-cache';
import assert from 'assert';
import { log } from './log.js';
import minimist from 'minimist';
import packer from './packer.js';
import path from 'path';
import { plusx } from './chmod.js';
import producer from './producer.js';
import reporter from './reporter.js';
import walker from './walker.js';
import { writeFile } from 'fs-promise';

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

export async function exec (argv2) {

  const argv = minimist(argv2, {
    string: [ 'c', 'config', 'l', 'loglevel', 'o',
      'output', 't', 'target', 'targets' ]
  });

  const loglevel = argv.l || argv.loglevel;

  if (loglevel) {
    if (!reporter.isCorrectLevel(loglevel)) {
      throw new Error('Incorrect loglevel: ' + loglevel);
    }
    reporter.level = loglevel;
  }

  if (argv._.length > 1) {
    throw new Error('Not more than one input file/directory is expected');
  }
  if (!argv._.length) {
    throw new Error('At least one input file/directory is expected');
  }

  const input = path.resolve(argv._[0]);
  let targets = parse(argv.t || argv.target || argv.targets);

  let output = argv.o || argv.output;
  if (!output) output = 'project'; // TODO from package.json.name?

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
    targets[0].output = output;
  } else {
    for (const target of targets) {
      let file = `${output}-${humanize(target)}`;
      if (target.platform === 'win') file += '.exe';
      target.output = file;
    }
  }

  let config = argv.c || argv.config;
  if (config) config = path.resolve(config);
  const records = await walker({ cli: { config, input } });

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
