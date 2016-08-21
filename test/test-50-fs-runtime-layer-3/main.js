#!/usr/bin/env node

let path = require('path');
let assert = require('assert');
let utils = require('../../utils.js');
let enclose = require('../../').exec;

assert(!module.parent);
assert(__dirname === process.cwd());

let flags = process.argv.slice(2);
let input = './test-x-index.js';
let output = './test-output.exe';

let right;

enclose.sync(flags.concat([
  '--output', output, input
]));

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(right,
  'true\n' +
  'false\n' +
  'Cannot write to packaged file\n' +
  'true\n' +
  'closed\n' +
  'false\n' +
  'Cannot write to packaged file\n' +
  'Cannot write to packaged file\n' +
  'undefined\n' +
  'Cannot write to packaged file\n' +
  'undefined\n'
);

utils.vacuum.sync(output);
