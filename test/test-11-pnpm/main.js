#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

// ignore this test if nodejs <= 10 , as recent version of PNPM do not support nodejs=10
const MAJOR_VERSION = parseInt(process.version.match(/v([0-9]+)/)[1], 10);
if (MAJOR_VERSION < 12) {
  console.log(
    'skiping test as it requires nodejs >= 12 and got',
    MAJOR_VERSION
  );
  return;
}

console.log(__dirname, process.cwd());
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './test.js';
const output = './test-output.exe';

console.log('target = ', target);

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
  { cwd: path.dirname(output), expect: 0 }
);
console.log('pnpm log :', pnpmlog);

// verify that we have the .pnpm folder and a symlinks module in node_modules
assert(fs.lstatSync(path.join(__dirname, 'node_modules/.pnpm')).isDirectory());
assert(
  fs.lstatSync(path.join(__dirname, 'node_modules/bonjour')).isSymbolicLink()
);

const logPkg = utils.pkg.sync([
  '--target',
  target,
  '--debug',
  '--output',
  output,
  input,
]);
assert(logPkg.match(/adding symlink/g));

// check that produced executable is running and produce the expected output.
const log = utils.spawn.sync(output, [], {
  cwd: path.dirname(output),
  expect: 0,
});
assert(log === '42\n');

// clean up
utils.vacuum.sync(output);
utils.vacuum.sync('./node_modules');
utils.vacuum.sync('./pnpm-lock.yaml');

console.log('OK');
