/* eslint-disable complexity */

import {
  STORE_BLOB, STORE_CONTENT, STORE_LINKS,
  STORE_STAT, isDotJS, isDotJSON
} from '../prelude/common.js';

import assert from 'assert';
import fs from 'fs-extra';
import { log } from './log.js';
import { version } from '../package.json';

const bootstrapText = fs.readFileSync(
  require.resolve('../prelude/bootstrap.js'), 'utf8'
).replace('%VERSION%', version);

const commonText = fs.readFileSync(
  require.resolve('../prelude/common.js'), 'utf8'
);

function itemsToText (items) {
  const len = items.length;
  return len.toString() +
    (len % 10 === 1 ? ' item' : ' items');
}

function hasAnyStore (record) {
  // discarded records like native addons
  for (const store of [ STORE_BLOB, STORE_CONTENT, STORE_LINKS, STORE_STAT ]) {
    if (record[store]) return true;
  }
  return false;
}

export default function ({ records, entrypoint, bytecode }) {
  const stripes = [];

  for (const snap in records) {
    const record = records[snap];
    const { file } = record;
    if (!hasAnyStore(record)) continue;
    assert(record[STORE_STAT], 'packer: no STORE_STAT');
    assert(record[STORE_BLOB] || record[STORE_CONTENT] || record[STORE_LINKS]);

    for (const store of [ STORE_BLOB, STORE_CONTENT, STORE_LINKS, STORE_STAT ]) {
      const value = record[store];
      if (!value) continue;

      if (store === STORE_BLOB ||
          store === STORE_CONTENT) {
        if (store === STORE_BLOB && !bytecode) {
          // bytecode===false suppresses any STORE_BLOB
        } else {
          if (record.body === undefined) {
            stripes.push({ snap, store, file });
          } else
          if (Buffer.isBuffer(record.body)) {
            stripes.push({ snap, store, buffer: record.body });
          } else
          if (typeof record.body === 'string') {
            stripes.push({ snap, store, buffer: Buffer.from(record.body) });
          } else {
            assert(false, 'packer: bad STORE_BLOB/STORE_CONTENT');
          }
        }
      } else
      if (store === STORE_LINKS) {
        if (Array.isArray(value)) {
          const buffer = Buffer.from(JSON.stringify(value));
          stripes.push({ snap, store, buffer });
        } else {
          assert(false, 'packer: bad STORE_LINKS');
        }
      } else
      if (store === STORE_STAT) {
        if (typeof value === 'object') {
          const newStat = Object.assign({}, value);
          newStat.atime = value.atime.getTime();
          newStat.mtime = value.mtime.getTime();
          newStat.ctime = value.ctime.getTime();
          newStat.birthtime = value.birthtime.getTime();
          newStat.isFileValue = value.isFile();
          newStat.isDirectoryValue = value.isDirectory();
          const buffer = Buffer.from(JSON.stringify(newStat));
          stripes.push({ snap, store, buffer });
        } else {
          assert(false, 'packer: bad STORE_STAT');
        }
      } else {
        assert(false, 'packer: unknown store');
      }
    }

    if (record[STORE_CONTENT]) {
      const disclosed = isDotJS(file) || isDotJSON(file);
      log.debug(disclosed ? 'The file was included as DISCLOSED code (with sources)'
                          : 'The file was included as asset content', file);
    } else
    if (record[STORE_BLOB]) {
      log.debug('The file was included as bytecode (no sources)', file);
    } else
    if (record[STORE_LINKS]) {
      const value = record[STORE_LINKS];
      log.debug('The directory files list was included (' + itemsToText(value) + ')', file);
    }
  }

  const prelude =
    'return (function (REQUIRE_COMMON, VIRTUAL_FILESYSTEM, DEFAULT_ENTRYPOINT) { ' +
      bootstrapText +
    '\n})(function (exports) {\n' +
      commonText +
    '\n},\n' +
      '%VIRTUAL_FILESYSTEM%' +
    '\n,\n' +
      '%DEFAULT_ENTRYPOINT%' +
    '\n);';

  return { prelude, entrypoint, stripes };
}
