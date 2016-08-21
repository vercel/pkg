#!/usr/bin/env node

let path = require('path');
let assert = require('assert');
let utils = require('../../utils.js');
let enclose = require('../../').exec;
let a2o = require('../../').argsToObject;

assert(!module.parent);
assert(__dirname === process.cwd());

let flags = process.argv.slice(2);
let input = './test-x-index.js';
let output = './test-output.exe';

let version = a2o(flags).version;
if (/^v?0.12./.test(version)) return;
if (/^v?4./.test(version)) return;

let right;

enclose.sync(flags.concat([
  '--output', output, input
]));

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(right, 'ok\n');
utils.vacuum.sync(output);
