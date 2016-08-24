#!/usr/bin/env node

'use strict';

let fs = require('fs');
let path = require('path');
let assert = require('assert');
let utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

let flags = process.argv.slice(2);
let input = './test-x-index.js';
let output = './test-output.exe';
let data = './test-y-data.txt';

let version = process.version;
if (/^v?0.12/.test(version)) return;
if (/^v?4/.test(version)) return;

let left, right;

left = fs.readFileSync(
  data, 'utf8'
).split('\n').filter(function (line) {
  return line.indexOf('/***/ ') >= 0;
}).map(function (line) {
  return line.split('/***/ ')[1];
}).join('\n') + '\n';

utils.pkg.sync(flags.concat([
  '--output', output, input
]));

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(left, right);
utils.vacuum.sync(output);
