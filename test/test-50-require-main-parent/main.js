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

left = utils.spawn.sync('node', [path.basename(input)], {
  cwd: path.dirname(input),
});

utils.pkg.sync(['--target', target, '--output', output, input]);

right = utils.spawn.sync('./' + path.basename(output), [], {
  cwd: path.dirname(output),
});

// это директории. под
// виндой они case-insensitive
left = left.toLowerCase();
right = right.toLowerCase();

left = left.split('\n');
right = right.split('\n');

assert.strictEqual(left.length, right.length);
assert(left.length > 100);

var nonSnapshot;
left.some(function (leftValue, index) {
  const rightValue = right[index];
  if (leftValue.slice(1, 3) === ':\\') {
    assert.strictEqual(rightValue.slice(1, 12), ':\\snapshot\\');
    nonSnapshot = rightValue.length - 12;
    assert.strictEqual(
      leftValue.slice(-nonSnapshot),
      rightValue.slice(-nonSnapshot)
    );
  } else if (leftValue.slice(0, 1) === '/') {
    assert.strictEqual(rightValue.slice(0, 10), '/snapshot/');
    nonSnapshot = rightValue.length - 10;
    assert.strictEqual(
      leftValue.slice(-nonSnapshot),
      rightValue.slice(-nonSnapshot)
    );
  } else if (leftValue === '') {
    assert.strictEqual(leftValue, rightValue);
  } else if (leftValue === 'empty') {
    assert.strictEqual(leftValue, rightValue);
  } else if (leftValue === 'string') {
    assert.strictEqual(leftValue, rightValue);
  } else if (leftValue === 'object') {
    assert.strictEqual(leftValue, rightValue);
  } else if (leftValue === 'function') {
    assert.strictEqual(leftValue, rightValue);
  } else if (leftValue === 'true') {
    assert.strictEqual(leftValue, rightValue);
  } else if (leftValue === 'false') {
    assert.strictEqual(leftValue, rightValue);
  } else if (leftValue === 'null') {
    assert.strictEqual(leftValue, rightValue);
  } else {
    console.log(leftValue, rightValue);
    assert(false);
  }
});

utils.vacuum.sync(path.dirname(output));
