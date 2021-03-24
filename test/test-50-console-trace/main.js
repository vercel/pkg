#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './test-x-index.js';
const output = './test-output.exe';

let right;

utils.pkg.sync(['--target', target, '--output', output, input]);

right = utils.spawn.sync('./' + path.basename(output), [], {
  cwd: path.dirname(output),
  stdio: 'pipe',
  expect: 0,
});

function extractFileName(line) {
  let m = line.match(/^.+\((.+):\d+:\d+\)$/);
  if (m) return m[1];
  m = line.match(/^.+\((.+):\d+\)$/);
  if (m) return m[1];
  m = line.match(/^.+\((.+)\)$/);
  if (m) return m[1];
  return undefined;
}

right = right.stderr.split('\n');
var a = right[0];
var b = extractFileName(right[2]);
var c = extractFileName(right[3]);
assert.strictEqual(a, b);
assert.strictEqual(c, 'pkg/prelude/bootstrap.js');
utils.vacuum.sync(output);
