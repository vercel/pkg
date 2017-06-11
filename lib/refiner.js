import { STORE_LINKS } from '../prelude/common.js';
import path from 'path';

export default function (records) {
  while (true) {
    let found = false;

    for (const file in records) {
      const record = records[file];
      const links = record[STORE_LINKS];
      if (links && links.length === 1) {
        const file2 = path.join(file, links[0]);
        const record2 = records[file2];
        if (!record2 || record2[STORE_LINKS]) {
          delete records[file];
          found = true;
        }
      }
    }

    if (!found) break;
  }

  return records;
}
