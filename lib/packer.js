let fs = require('fs');
let path = require('path');
let assert = require('assert');
let common = require('./common.js');
let reporter = require('./reporter.js');

let STORE_CODE = common.STORE_CODE;
let STORE_CONTENT = common.STORE_CONTENT;
let STORE_LINKS = common.STORE_LINKS;
let STORE_STAT = common.STORE_STAT;

let isDotJS = common.isDotJS;
let isDotJSON = common.isDotJSON;
let theboxify = common.theboxify;

let preludeText = fs.readFileSync(
  path.join(__dirname, 'prelude.js'), 'utf8'
);

let commonText = fs.readFileSync(
  path.join(__dirname, 'common.js'), 'utf8'
);

function itemsToText (items) {
  let len = items.length;
  return len.toString() +
    (len % 10 === 1 ? ' item' : ' items');
}

function reduceRecords (records) {

  assert(Array.isArray(records), 'packer: bad records to reduce');
  let result = {};

  records.some(function (record) {
    if (record.discard) return;
    let file = record.file;
    if (!result[file]) result[file] = {};
    result[file][record.store] = record.body;
  });

  return result;

}

function packer (opts, cb) {

  let stripe = [];

  function write (x) {
    assert(typeof x === 'string', 'packer: can write only strings');
    stripe.push(x);
  }

  let records = reduceRecords(opts.records);

  write('(function(REQUIRE_COMMON, VIRTUAL_FILESYSTEM, DEFAULT_ENTRYPOINT) {');
  write(preludeText);
  write('})(function(exports) {');
  write(commonText);
  write('}, {\n');

  let first1 = true;

  Object.keys(records).some(function (file) {

    if (!first1) write(',');
    first1 = false;

    write(JSON.stringify(theboxify(file)));
    write(':[\n');

    let record = records[file];
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

      let value = record[store];

      if (typeof value === 'undefined') {
        write('null');
        return;
      }

      if (store === STORE_CODE) {

        assert(typeof value === 'string', 'packer: bad STORE_CODE');

        write('function(exports, require, module, __filename, __dirname) {\n');
        write(value);
        write('\n}'); // dont remove \n, otherwise last comment will cover right brace

        reporter.report(file, 'info', [
          'The file was included into output executable as enclosed code'
        ]);

      } else
      if (store === STORE_CONTENT) {

        if (Buffer.isBuffer(value)) {
          write('Buffer(\'');
          write(value.toString('base64'));
          write('\',\'base64\')');
        } else
        if (typeof value === 'string') {
          write('Buffer(\'');
          write((new Buffer(value)).toString('base64'));
          write('\',\'base64\')');
        } else {
          assert(false, 'packer: bad STORE_CONTENT');
        }

        let disclosed = isDotJS(file) || isDotJSON(file);
        reporter.report(file, 'info', [
          disclosed ? 'The file was included into output executable as DISCLOSED code'
                    : 'The file was included into output executable as asset content'
        ]);

      } else
      if (store === STORE_LINKS) {

        assert(Array.isArray(value), 'packer: bad STORE_LINKS');
        write(JSON.stringify(value));
        reporter.report(file, 'info', [
          'The directory listing was included into executable (' + itemsToText(value) + ')'
        ]);

      } else
      if (store === STORE_STAT) {

        assert(typeof value === 'object', 'packer: bad STORE_STAT');
        value.atime = value.atime.getTime();
        value.mtime = value.mtime.getTime();
        value.ctime = value.ctime.getTime();
        value.birthtime = value.birthtime.getTime();
        value.isFileValue = value.isFile();
        value.isDirectoryValue = value.isDirectory();
        write(JSON.stringify(value));

      } else {
        assert(false, 'packer: unknown store');
      }

    });

    write('\n]');

  });

  write('\n},');

  opts.records.some(function (record) {
    if (record.entrypoint) {

      write(JSON.stringify(theboxify(record.file)));
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
