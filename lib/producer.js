let fs = require('fs');
let spawn = require('child_process').spawn;
let reporter = require('./reporter.js');

let prepend = '(function(process, require, console) {\n';
let append = '\n})'; // dont remove \n

let sentinel = (function () {
  let b = new Buffer(12);
  b.writeInt32LE(0x26e0c928, 0);
  b.writeInt32LE(0x41f32b66, 4);
  b.writeInt32LE(0x3ea13ccf, 8);
  return b;
}());

let padding = function (sz) {
  return new Buffer({
    0: 0, 1: 3, 2: 2, 3: 1
  }[sz % 4]);
};

let buffer4 = function (v) {
  let b = new Buffer(4);
  b.writeInt32LE(v, 0);
  return b;
};

module.exports = function (opts, cb) {

  let stripe = opts.stripe;
  stripe.unshift(prepend);
  stripe.push(append);
  let extra = new Buffer(stripe.join(''));

  let fabricator;
  let fabricatorName = opts.fabricatorName;
  let fabricatorArgs = [ '--fabricator' ];

  try {
    fabricator = spawn(fabricatorName, fabricatorArgs);
    fabricator.stdin.write(buffer4(extra.length));
    fabricator.stdin.write(extra);
    fabricator.stdin.end();
  } catch (error) {
    reporter.report(fabricatorName, 'error', [
      'Failed to spawn fabricator ' + fabricatorName,
      error.toString()
    ], error);
    return cb(error);
  }

  let snapshotChunks = [];

  fabricator.stderr.on('data', function (ch) {
    process.stdout.write(ch);
  });

  fabricator.stderr.on('end', fabricatorMaybeExit);

  fabricator.stdout.on('data', function (ch) {
    snapshotChunks.push(ch);
  });

  fabricator.stdout.on('end', fabricatorMaybeExit);

  fabricator.on('exit', function (code) {
    if (code !== 0) {
      let error = new Error('Fabricator exited with code ' + code.toString());
      reporter.report('', 'error', error.message, error);
      return cb(error);
    }
    fabricatorMaybeExit();
  });

  let fabricatorCounter = 0;
  function fabricatorMaybeExit () {

    fabricatorCounter += 1;
    if (fabricatorCounter !== 3) return;

    let snapshot = Buffer.concat(snapshotChunks);

    if (snapshot.length === 0) {
      let error = new Error('Empty fabricator output');
      reporter.report('', 'error', error.message, error);
      return cb(error);
    }

    let house = fs.readFileSync(fabricatorName);

    cb(null, Buffer.concat([
      house,
      padding(house.length),
      sentinel,
      buffer4(snapshot.length),
      snapshot
    ]));

  }

};
