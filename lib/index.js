import { need, system } from 'pkg-cache';
import assert from 'assert';
import bundler from './bundler.js';
import { log } from './log.js';
import minimist from 'minimist';
import path from 'path';
import { plusx } from './chmod.js';
import producer from './producer.js';
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
    string: [ 't' ]
  });

  if (argv._.length > 1) {
    throw new Error('Not more than one input file/directory is expected');
  }
  if (!argv._.length) {
    throw new Error('At least one input file/directory is expected');
  }

  const input = path.resolve(argv._[0]);
  const { t } = argv;
  let targets = parse(t);

  if (!targets.length) {
    targets = parse('-'); // will produce all default values
    assert(targets.length === 1);
    log.warn(`Targets not specified. Assuming ${humanize(targets[0])}`);
  }

  for (const target of targets) {
    target.binaryPath = await need(target);
    const f = target.fabricator = fabricatorForTarget(target);
    f.binaryPath = await need(f);
    if (f.platform !== 'win') {
      await plusx(f.binaryPath);
    }
  }

  const stripe = await bundler({ cli: { input } });
  const projectName = 'project';

  for (const target of targets) {
    const buffer = await producer({
      stripe,
      fabricatorName: target.fabricator.binaryPath,
      houseName: target.binaryPath
    });
    let file = `${projectName}-${humanize(target)}`;
    if (target.platform === 'win') {
      file += '.exe';
    }
    await writeFile(file, buffer);
    if (target.platform !== 'win') {
      await plusx(file);
    }
  }
}
