#!/usr/bin/env node

let path = require('path');
let assert = require('assert');
let utils = require('../../utils.js');
let enclose = require('../../').exec;

assert(!module.parent);
assert(__dirname === process.cwd());

let flags = process.argv.slice(2);
let input = './test-x-index.js';
let output = './run-time/test-output.exe';

let right;
utils.mkdirp.sync(path.dirname(output));

enclose.sync(flags.concat([
  '--output', output, input
]));

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert(
  right.split('*****')[0].indexOf('was not included into executable at compilation stage') >= 0
);

assert(
  right.split('*****')[1].indexOf('you want to enclose the package') >= 0
);

utils.vacuum.sync(path.dirname(output));
