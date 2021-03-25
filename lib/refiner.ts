import path from 'path';
import {
  STORE_LINKS,
  retrieveDenominator,
  substituteDenominator,
} from './common';
import { FileRecords } from './types';

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
  // eslint-disable-next-line no-constant-condition
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
                // eslint-disable-next-line no-param-reassign
                delete records[file];
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
  denominator: number
) {
  const newRecords: FileRecords = {};

  for (const file in records) {
    if (records[file]) {
      let snap = substituteDenominator(file, denominator);

      if (win32) {
        if (snap.slice(1) === ':') snap += '\\';
      } else if (snap === '') {
        snap = '/';
      }

      newRecords[snap] = records[file];
    }
  }

  return {
    records: newRecords,
    entrypoint: substituteDenominator(entrypoint, denominator),
  };
}

export default function refiner(records: FileRecords, entrypoint: string) {
  purgeTopDirectories(records);
  const denominator = retrieveDenominator(Object.keys(records));
  return denominate(records, entrypoint, denominator);
}
