import { STORE_LINKS, retrieveDenominator,
  substituteDenominator } from '../prelude/common.js';
import path from 'path';

function hasParent (file, records) {
  const dirname = path.dirname(file);
  if (dirname === file) return false; // root directory
  return Boolean(records[dirname]);
}

function purgeTopDirectories (records) {
  while (true) {
    let found = false;

    for (const file in records) {
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
              found = true;
            }
          }
        }
      }
    }

    if (!found) break;
  }
}

const win32 = process.platform === 'win32';

function denominate (records, entrypoint, denominator) {
  const newRecords = {};

  for (const file in records) {
    let snap = substituteDenominator(file, denominator);

    if (win32) {
      if (snap.slice(1) === ':') snap += '\\';
    } else {
      if (snap === '') snap = '/';
    }

    newRecords[snap] = records[file];
  }

  return {
    records: newRecords,
    entrypoint: substituteDenominator(entrypoint, denominator)
  };
}

export default function (records, entrypoint) {
  purgeTopDirectories(records);
  const denominator = retrieveDenominator(Object.keys(records));
  return denominate(records, entrypoint, denominator);
}
