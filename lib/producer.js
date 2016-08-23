const fs = require('fs');
const spawn = require('child_process').spawn;
const reporter = require('./reporter.js');

const prepend = '(function(process, require, console) {\n';
const append = '\n})'; // dont remove \n

const sentinel = (function () {
  const b = new Buffer(12);
  b.writeInt32LE(0x26e0c928, 0);
  b.writeInt32LE(0x41f32b66, 4);
  b.writeInt32LE(0x3ea13ccf, 8);
  return b;
}());

const padding = function (sz) {
  return new Buffer({
    0: 0, 1: 3, 2: 2, 3: 1
  }[sz % 4]);
};

const buffer4 = function (v) {
  const b = new Buffer(4);
  b.writeInt32LE(v, 0);
  return b;
};

function producer (opts, cb) {

  const stripe = opts.stripe.slice(0);
  stripe.unshift(prepend);
  stripe.push(append);
  const extra = new Buffer(stripe.join(''));

  let fabricator;
  const fabricatorName = opts.fabricatorName;
  const fabricatorArgs = [ '--fabricator' ];

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

  const snapshotChunks = [];

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
      const error = new Error('Fabricator exited with code ' + code.toString());
      reporter.report('', 'error', error.message, error);
      return cb(error);
    }
    fabricatorMaybeExit();
  });

  let fabricatorCounter = 0;
  function fabricatorMaybeExit () {

    fabricatorCounter += 1;
    if (fabricatorCounter !== 3) return;

    const snapshot = Buffer.concat(snapshotChunks);

    if (snapshot.length === 0) {
      const error = new Error('Empty fabricator output');
      reporter.report('', 'error', error.message, error);
      return cb(error);
    }

    const houseName = opts.houseName || fabricatorName;
    const house = fs.readFileSync(houseName);

    cb(null, Buffer.concat([
      house,
      padding(house.length),
      sentinel,
      buffer4(snapshot.length),
      snapshot
    ]));

  }

}

module.exports = function (opts) {
  return new Promise((resolve, reject) => {
    producer(opts, (error, bundle) => {
      if (error) return reject(error);
      resolve(bundle);
    });
  });
};
