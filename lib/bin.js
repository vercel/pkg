import { exec } from './index.js';
import { log } from './log.js';

async function main () {
  await exec(process.argv.slice(2));
}

main().catch((error) => {
  log.error(error);
  process.exit(2);
});
