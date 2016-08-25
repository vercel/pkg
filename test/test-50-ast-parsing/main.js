#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2];
const input = './test-x-index.js';
const output = './test-output.exe';
const data = './test-y-data.txt';

const version = process.version;
if (/^v?0/.test(version)) return;
if (/^v?4/.test(version)) return;

let left, right;

left = fs.readFileSync(
  data, 'utf8'
).split('\n').filter(function (line) {
  return line.indexOf('/***/ ') >= 0;
}).map(function (line) {
  return line.split('/***/ ')[1];
}).join('\n') + '\n';

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
