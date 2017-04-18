#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './test-x-index.js';
const output = './run-time/test-output.exe';

let left, right;
utils.mkdirp.sync(path.dirname(output));

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

// case-insensitive for windows
left = left.toLowerCase();
right = right.toLowerCase();

left = left.split('\n');
right = right.split('\n');

assert.equal(left.length, right.length);

left.some(function (leftValue, index) {
  const rightValue = right[index];
  if (leftValue.slice(1, 3) === ':\\') {
    assert.equal(rightValue.slice(1, 3), ':\\');
    leftValue = leftValue.slice(0, 3) + 'snapshot\\' + leftValue.slice(3);
    assert.equal(leftValue, rightValue);
  } else
  if (leftValue.slice(0, 1) === '/') {
    assert.equal(rightValue.slice(0, 1), '/');
    leftValue = '/snapshot' + leftValue;
    assert.equal(leftValue, rightValue);
  } else {
    assert.equal(leftValue, rightValue);
  }
});

utils.vacuum.sync(path.dirname(output));
