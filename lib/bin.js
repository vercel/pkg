#!/usr/bin/env node

import { exec } from './index.js';
import { log } from './log.js';

async function main () {
  if (process.env.CHDIR &&
      process.env.CHDIR !== process.cwd()) {
    // allow to override cwd by CHDIR env var
    // https://github.com/resin-io/etcher/pull/1713
    process.chdir(process.env.CHDIR);
  }

  await exec(process.argv.slice(2));
}

main().catch((error) => {
  if (!error.wasReported) log.error(error);
  process.exit(2);
});
