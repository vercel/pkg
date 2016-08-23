let async = require('async');
let walker = require('./walker.js');
let packer = require('./packer.js');

function bundler (opts, cb) {

  async.waterfall([
    function (next) {

      walker({
        cli: opts.cli,
        config: opts.config
      }, next);

    },
    function (records, next) {

      packer({
        records: records
      }, next);

    }
  ], cb);

}

module.exports = function (opts) {
  return new Promise((resolve, reject) => {
    bundler(opts, (error, bundle) => {
      if (error) return reject(error);
      resolve(bundle);
    });
  });
};

if (!module.parent) {

  let stdin = '';

  process.stdin.on('data', function (chunk) {
    stdin += chunk.toString();
  });

  process.stdin.on('end', function () {
    let opts = JSON.parse(stdin);
    bundler(opts, function (error, blob) {
      if (error) throw error;
      process.stdout.write(blob);
    });
  });

}
