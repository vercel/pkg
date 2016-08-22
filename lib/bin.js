import { need, system } from 'pkg-cache';
import assert from 'assert';
import { log } from './log.js';
import minimist from 'minimist';

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

async function main () {
  const argv = minimist(process.argv.slice(2), {
    string: [ 't' ]
  });

  if (argv._.length > 1) {
    throw new Error('Only one input file/directory is expected');
  }
  if (!argv._.length) {
    throw new Error('At least one input file/directory is expected');
  }

  const input = argv._[0];
  const { t } = argv;
  let targets = parse(t);

  if (!targets.length) {
    targets = parse('-'); // will produce all default values
    assert(targets.length === 1);
    log.warn(`Targets not specified. Assuming ${humanize(targets[0])}`);
  }

  console.log(await need(targets[0]));
}

main().catch((error) => {
  log.error(error);
  process.exit(2);
});
