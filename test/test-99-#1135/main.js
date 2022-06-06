#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(__dirname === process.cwd());

/* only run on host */
if (process.argv[2] && process.argv[2] !== 'host') {
  console.log('skipped test');
  return;
}
const target = /* process.argv[2] || */ 'host';
const input = './package.json';
const output = path.join(
  __dirname,
  './test-output' + (process.platform === 'win32' ? '.exe' : '')
);

console.log('target = ', target);

// remove any possible left-over
utils.vacuum.sync('./node_modules');

const version = utils.exec.sync('node --version');
console.log('node version = ', version);

// launch `npm install`
const npmlog = utils.exec.sync('npm install');
console.log('npm log :', npmlog);

assert(fs.lstatSync(path.join(__dirname, 'node_modules/canvas')).isDirectory());
assert(
  fs.lstatSync(path.join(__dirname, 'node_modules/canvas/build')).isDirectory()
);
assert(
  fs
    .lstatSync(path.join(__dirname, 'node_modules/canvas/build/Release'))
    .isDirectory()
);
assert(
  fs
    .lstatSync(
      path.join(__dirname, 'node_modules/canvas/build/Release/canvas.node')
    )
    .isFile()
);

utils.pkg.sync(['--target', target, '--debug', '--output', output, input]);

// check that produced executable is running and produce the expected output.
const log = utils.spawn.sync(output, [], {
  cwd: path.dirname(output),
  expect: 0,
});
console.log(log);
// assert(log === '42\n');

// clean up
utils.vacuum.sync(output);
utils.vacuum.sync('./node_modules');
utils.vacuum.sync('./package-lock.json');

console.log('OK');
