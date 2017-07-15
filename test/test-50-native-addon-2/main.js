#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const host = 'node' + process.version[1];
const target = process.argv[2] || host;
const pairs = [
  { input: './lib/test-x-index.js', output: './lib/test-output.exe' },
  { input: './lib/test-x-index.js', output: './lib/community/test-output.exe' },
  { input: './lib/test-x-index.js', output: './lib/enterprise/test-output.exe' },
  { input: './lib/community/test-y-index.js', output: './lib/community/test-output.exe' },
  { input: './lib/enterprise/test-z-index.js', output: './lib/enterprise/test-output.exe' }
];

pairs.some(function (pair) {
  const input = pair.input;
  const output = pair.output;

  let left, right;

  left = utils.spawn.sync(
    'node', [ path.basename(input) ],
    { cwd: path.dirname(input) }
  );

  utils.pkg.sync([
    '--target', target,
    '--output', output, input
  ]);

  right = utils.spawn.sync(
    './' + path.basename(output), [],
    { cwd: path.dirname(output) }
  );

  assert.equal(left, right);
  utils.vacuum.sync(output);
});
