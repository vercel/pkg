#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');
const os = require('os');

const MAJOR_VERSION = parseInt(process.version.match(/v([0-9]+)/)[1], 10);

if (MAJOR_VERSION < 14) {
  console.log(
    'skiping test as it requires nodejs >= 14',
    MAJOR_VERSION
  );
  return;
}

assert(__dirname === process.cwd());

const ext = process.platform === 'win32' ? '.exe' : '';

const target = process.argv[2] || 'host';
const input = './test.js';
const output = './test-output' + ext;

console.log('target = ', target);
utils.pkg.sync([
  '--target',
  target,
  '--output',
  output,
  input,
]);

// check that produced executable is running and produce the expected output.
const log = utils.spawn.sync(output, [], {
  cwd: path.dirname(output),
  expect: 0,
});
assert(log === os.arch() + '\n');

// clean up
utils.vacuum.sync(output);

console.log('OK');
