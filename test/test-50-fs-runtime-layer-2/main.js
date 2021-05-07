#!/usr/bin/env node

/* eslint-disable no-multi-spaces */

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const host = 'node' + process.version.match(/^v(\d+)/)[1];
const target = process.argv[2] || host;
const input = './test-x-index.js';
const output = './run-time/test-output.exe';

// see readFromSnapshot "NODE_VERSION_MAJOR"

function bitty(version) {
  return (
    (2 * /^(node|v)?4/.test(version)) |
    (2 * /^(node|v)?5/.test(version)) |
    (4 * /^(node|v)?6/.test(version)) |
    (4 * /^(node|v)?7/.test(version)) |
    (4 * /^(node|v)?8/.test(version)) |
    (4 * /^(node|v)?9/.test(version)) |
    (8 * /^(node|v)?10/.test(version)) |
    (8 * /^(node|v)?11/.test(version)) |
    (16 * /^(node|v)?12/.test(version)) |
    (16 * /^(node|v)?13/.test(version)) |
    (32 * /^(node|v)?14/.test(version)) |
    (32 * /^(node|v)?16/.test(version))
  );
}

const version1 = process.version;
const version2 = target;
if (bitty(version1) !== bitty(version2)) return;

let left, right;
utils.mkdirp.sync(path.dirname(output));

left = utils.spawn.sync('node', [path.basename(input)], {
  cwd: path.dirname(input),
});

utils.pkg.sync(['--target', target, '--output', output, input]);

right = utils.spawn.sync('./' + path.basename(output), [], {
  cwd: path.dirname(output),
});

left = left.split('\n');
right = right.split('\n');
// right may have less lines, premature exit,
// less trusted, so using left.length here
for (let i = 0; i < left.length; i += 1) {
  if (/is out of range/.test(left[i]) && /is out of range/.test(right[i])) {
    left[i] = left[i].replace(/ It must be .*\. /, ' ');
    right[i] = right[i].replace(/ It must be .*\. /, ' ');
  }
  assert.strictEqual(left[i], right[i]);
}

utils.vacuum.sync(path.dirname(output));
