#!/usr/bin/env node

let fs = require('fs');
let path = require('path');
let assert = require('assert');
let utils = require('../../utils.js');
let enclose = require('../../').exec;

assert(!module.parent);
assert(__dirname === process.cwd());

let flags = process.argv.slice(2);
let input = './test-x-index.js';
let output = './test-output.exe';
let data = './test-y-data.txt';

let left, right;

left = fs.readFileSync(
  data, 'utf8'
).split('\n').filter(function (line) {
  return line.indexOf('/***/ ') >= 0;
}).map(function (line) {
  return line.split('/***/ ')[1];
}).join('\n') + '\n';

enclose.sync(flags.concat([
  '--output', output, input
]));

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(left, right);
utils.vacuum.sync(output);
