#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const darwin = process.platform === 'darwin';
if (!darwin) {
  return;
}

const target = process.argv[2] || 'host';
const input = './test-x-index.js';
const output = './test-output';

let right;

utils.pkg.sync([
  '--no-signature',
  '--target',
  target,
  '--output',
  output,
  input,
]);

right = utils.spawn.sync('codesign', ['-dv', './' + path.basename(output)], {
  stdio: 'pipe',
  expect: 1,
});

assert.strictEqual(
  right.stderr,
  './test-output: code object is not signed at all\n'
);

utils.vacuum.sync(output);
