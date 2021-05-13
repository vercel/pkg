#!/usr/bin/env node

'use strict';

/*
 * A test with a large number of modules with symlinks
 * (installed with npm) and compress
 *
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

// ignore this test if nodejs <= 10 , as recent version of PNPM do not support nodejs=10
const MAJOR_VERSION = parseInt(process.version.match(/v([0-9]+)/)[1], 10);
if (MAJOR_VERSION < 12) {
  return;
}

// remove any possible left-over
utils.vacuum.sync('./node_modules');
utils.vacuum.sync('./pnpm-lock.yaml');

// launch `pnpm install`
const pnpmlog = utils.spawn.sync(
  path.join(
    path.dirname(process.argv[0]),
    'npx' + (process.platform === 'win32' ? '.cmd' : '')
  ),
  ['pnpm', 'install'],
  { cwd: path.dirname(__filename), expect: 0 }
);
console.log('pnpm log :', pnpmlog);

// verify that we have the .pnpm folder and a symlinks module in node_modules
assert(fs.lstatSync(path.join(__dirname, 'node_modules/.pnpm')).isDirectory());
assert(
  fs
    .lstatSync(path.join(__dirname, 'node_modules/node-opcua-address-space'))
    .isSymbolicLink()
);

/* eslint-disable no-unused-vars */
const input = 'package.json';
const target = process.argv[2] || 'host';
const ext = process.platform === 'win32' ? '.exe' : '';
const outputRef = 'test-output-empty' + ext;
const outputNone = 'test-output-None' + ext;
const outputGZip = 'test-output-GZip' + ext;
const outputBrotli = 'test-output-Brotli' + ext;
const outputBrotliDebug = 'test-output-Brotli-debug' + ext;

const inspect = ['ignore', 'ignore', 'pipe'];

console.log(' compiling  empty ');
const logPkg0 = utils.pkg.sync(
  [
    '--target',
    target,
    '--compress',
    'None',
    '--output',
    outputRef,
    './test-empty.js',
  ],
  { stdio: inspect, expect: 0 }
);
const sizeReference = fs.statSync(outputRef).size;

function pkgCompress(compressMode, output) {
  console.log(` compiling compression ${compressMode} `);
  const logPkg1 = utils.pkg.sync(
    ['--target', target, '--compress', compressMode, '--output', output, input],
    { stdio: inspect, expect: 0 }
  );
  // check that produced executable is running and produce the expected output.
  const log = utils.spawn.sync(path.join(__dirname, output), [], {
    cwd: __dirname,
    expect: 0,
  });
  assert(log === '42\n');
  return fs.statSync(output).size;
}

const sizeNoneFull = pkgCompress('None', outputNone);
const sizeGZipFull = pkgCompress('GZip', outputGZip);
const sizeBrotliFull = pkgCompress('Brotli', outputBrotli);

const sizeNone = sizeNoneFull - sizeReference;
const sizeBrotli = sizeBrotliFull - sizeReference;
const sizeGZip = sizeGZipFull - sizeReference;

console.log('empty           = ', sizeReference);
console.log('no compression  = ', sizeNoneFull, sizeNone);
console.log('Brotli          = ', sizeBrotliFull, sizeBrotli);
console.log('GZip            = ', sizeGZipFull, sizeGZip);

console.log(
  '        Δ GZip = ',
  sizeGZip - sizeNone,
  '(',
  (((sizeGZip - sizeNone) / sizeNone) * 100).toFixed(0),
  '%)'
);
console.log(
  '      Δ Brotli = ',
  sizeBrotli - sizeNone,
  '(',
  (((sizeBrotli - sizeNone) / sizeNone) * 100).toFixed(0),
  '%)'
);

assert(sizeNone > sizeGZip);
assert(sizeGZip > sizeBrotli);

const logPkg5 = utils.pkg.sync(
  ['--target', target, '--compress', 'Crap', '--output', outputBrotli, input],
  { expect: 2 }
);

// xx console.log(logPkg4);
assert(logPkg5.match(/Invalid compression algorithm/g));

utils.vacuum.sync(outputRef);
utils.vacuum.sync(outputNone);
utils.vacuum.sync(outputBrotli);
utils.vacuum.sync(outputGZip);
utils.vacuum.sync(outputBrotliDebug);
utils.vacuum.sync('node_modules');
utils.vacuum.sync('./pnpm-lock.yaml');

console.log('OK');
