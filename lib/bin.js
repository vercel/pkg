import { need, system } from 'pkg-cache';
import { log } from './log.js';
import minimist from 'minimist';

const { hostArch, hostPlatform, knownArchs,
  knownPlatforms, toFancyArch, toFancyPlatform } = system;
const hostNodeRange = process.version[1];

export function parseTargets (ts) {
  // v6-osx-x64,v6-linux-x64
  if (!ts) return [];
  const targets = [];
  for (const t of ts.split(',')) {
    const target = {};
    for (const token of t.split('-')) {
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
    if (!target.nodeRange) {
      target.nodeRange = hostNodeRange;
    }
    if (!target.platform) {
      target.platform = hostPlatform;
    }
    if (!target.arch) {
      target.arch = hostArch;
    }
    targets.push(target);
  }
  return targets;
}

async function main () {
  const argv = minimist(process.argv.slice(2));

  if (argv._.length > 1) {
    throw new Error('Only one input file/directory is expected');
  }
  if (argv._.length === 0) {
    throw new Error('At least one input file/directory is expected');
  }

  const input = argv._[0];
  const { t } = argv;
  const targets = parseTargets(t);

  console.log(await need(targets[0]));
}

main().catch((error) => {
  log.error(error);
  process.exit(2);
});
