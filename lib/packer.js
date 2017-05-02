const fs = require('fs');
const assert = require('assert');
const common = require('../prelude/common.js');
const log = require('./log.js').log;
const pkgVersion = require('../package.json').version;

const STORE_CODE = common.STORE_CODE;
const STORE_CONTENT = common.STORE_CONTENT;
const STORE_LINKS = common.STORE_LINKS;
const STORE_STAT = common.STORE_STAT;

const isDotJS = common.isDotJS;
const isDotJSON = common.isDotJSON;
const snapshotify = common.snapshotify;

const bootstrapText = fs.readFileSync(
  require.resolve('../prelude/bootstrap.js'), 'utf8'
).replace('%PKG_VERSION%', pkgVersion);

const commonText = fs.readFileSync(
  require.resolve('../prelude/common.js'), 'utf8'
);

function itemsToText (items) {
  const len = items.length;
  return len.toString() +
    (len % 10 === 1 ? ' item' : ' items');
}

function reduceRecords (records) {
  assert(Array.isArray(records), 'packer: bad records to reduce');
  const result = {};

  records.some(function (record) {
    if (record.discard) return;
    const file = record.file;
    if (!result[file]) result[file] = {};
    result[file][record.store] = record.body;
  });

  return result;
}

function packer (opts, cb) {
  const stripe = [];

  function write (x) {
    assert(typeof x === 'string', 'packer: can write only strings');
    stripe.push(x);
  }

  const records = reduceRecords(opts.records);

  write('(function(REQUIRE_COMMON, VIRTUAL_FILESYSTEM, DEFAULT_ENTRYPOINT) {');
  write(bootstrapText);
  write('})(function(exports) {');
  write(commonText);
  write('}, {\n');

  let first1 = true;

  Object.keys(records).some(function (file) {
    if (!first1) write(',');
    first1 = false;

    write(JSON.stringify(snapshotify(file, opts.slash)));
    write(':[\n');

    const record = records[file];
    assert(record[STORE_STAT], 'packer: no STORE_STAT');

    if ((typeof record[STORE_CODE] !== 'undefined') &&
        (typeof record[STORE_CONTENT] !== 'undefined')) {
      delete record[STORE_CODE];
    }

    let first2 = true;

    [ STORE_CODE, STORE_CONTENT, STORE_LINKS, STORE_STAT
    ].some(function (store, index) {
      assert(store === index, 'packer: stores misordered');
      if (!first2) write(',');
      first2 = false;

      const value = record[store];

      if (typeof value === 'undefined') {
        write('null');
        return;
      }

      if (store === STORE_CODE) {
        assert(typeof value === 'string', 'packer: bad STORE_CODE');

        write('function(exports, require, module, __filename, __dirname) {\n');
        write(value);
        write('\n}'); // dont remove \n, otherwise last comment will cover right brace

        log.debug('The file was included as compiled code (no sources)', file);
      } else
      if (store === STORE_CONTENT) {
        if (Buffer.isBuffer(value)) {
          write('new Buffer(\'');
          write(value.toString('base64'));
          write('\',\'base64\')');
        } else
        if (typeof value === 'string') {
          write('new Buffer(\'');
          write((new Buffer(value)).toString('base64'));
          write('\',\'base64\')');
        } else {
          assert(false, 'packer: bad STORE_CONTENT');
        }

        const disclosed = isDotJS(file) || isDotJSON(file);
        log.debug(disclosed ? 'The file was included as DISCLOSED code (with sources)'
                            : 'The file was included as asset content', file);
      } else
      if (store === STORE_LINKS) {
        assert(Array.isArray(value), 'packer: bad STORE_LINKS');
        write(JSON.stringify(value));
        log.debug('The directory files list was included (' + itemsToText(value) + ')', file);
      } else
      if (store === STORE_STAT) {
        assert(typeof value === 'object', 'packer: bad STORE_STAT');
        const newValue = Object.assign({}, value);
        newValue.atime = value.atime.getTime();
        newValue.mtime = value.mtime.getTime();
        newValue.ctime = value.ctime.getTime();
        newValue.birthtime = value.birthtime.getTime();
        newValue.isFileValue = value.isFile();
        newValue.isDirectoryValue = value.isDirectory();
        write(JSON.stringify(newValue));
      } else {
        assert(false, 'packer: unknown store');
      }
    });

    write('\n]');
  });

  write('\n},');

  opts.records.some(function (record) {
    if (record.entrypoint) {
      write(JSON.stringify(snapshotify(record.file, opts.slash)));
      return true;
    }
  });

  write('\n)');

  cb(null, stripe);
}

module.exports = function (opts) {
  return new Promise((resolve, reject) => {
    packer(opts, (error, stripe) => {
      if (error) return reject(error);
      resolve(stripe);
    });
  });
};
