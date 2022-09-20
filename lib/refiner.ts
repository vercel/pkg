import path from 'path';
import chalk from 'chalk';
import {
  STORE_LINKS,
  retrieveDenominator,
  substituteDenominator,
} from './common';
import { FileRecords, SymLinks } from './types';
import { log } from './log';

const win32 = process.platform === 'win32';

function hasParent(file: string, records: FileRecords) {
  const dirname = path.dirname(file);

  // root directory
  if (dirname === file) {
    return false;
  }

  return Boolean(records[dirname]);
}

function purgeTopDirectories(records: FileRecords) {
  while (true) {
    let found = false;

    for (const file in records) {
      if (records[file]) {
        const record = records[file];
        const links = record[STORE_LINKS];

        if (links && links.length === 1) {
          if (!hasParent(file, records)) {
            const file2 = path.join(file, links[0]);
            const record2 = records[file2];
            const links2 = record2[STORE_LINKS];

            if (links2 && links2.length === 1) {
              const file3 = path.join(file2, links2[0]);
              const record3 = records[file3];
              const links3 = record3[STORE_LINKS];

              if (links3) {
                delete records[file];
                log.debug(chalk.cyan('Deleting record file :', file));
                found = true;
              }
            }
          }
        }
      }
    }

    if (!found) break;
  }
}

function denominate(
  records: FileRecords,
  entrypoint: string,
  denominator: number,
  symLinks: SymLinks
) {
  const newRecords: FileRecords = {};

  const makeSnap = (file: string) => {
    let snap = substituteDenominator(file, denominator);

    if (win32) {
      if (snap.slice(1) === ':') snap += '\\';
    } else if (snap === '') {
      snap = '/';
    }

    return snap;
  };

  for (const file in records) {
    if (records[file]) {
      const snap = makeSnap(file);
      newRecords[snap] = records[file];
    }
  }

  const tmpSymLinks = symLinks;
  symLinks = {};

  for (const [key, value] of Object.entries(tmpSymLinks)) {
    const key1 = makeSnap(key);
    const value1 = makeSnap(value);
    symLinks[key1] = value1;
  }

  return {
    records: newRecords,
    entrypoint: substituteDenominator(entrypoint, denominator),
    symLinks,
  };
}

export default function refiner(
  records: FileRecords,
  entrypoint: string,
  symLinks: SymLinks
) {
  purgeTopDirectories(records);
  const denominator = retrieveDenominator(Object.keys(records));
  return denominate(records, entrypoint, denominator, symLinks);
}
