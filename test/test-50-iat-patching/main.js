#!/usr/bin/env node

'use strict';

let path = require('path');
let assert = require('assert');
let utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

let flags = process.argv.slice(2);
let input = './test-x-index.js';
let output = './test-output.exe';

let left, right;

left = utils.spawn.sync(
  'node', [ path.basename(input) ],
  { cwd: path.dirname(input) }
);

utils.pkg.sync(flags.concat([
  '--output', output, input
]));

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(left, right);
utils.vacuum.sync(output);
utils.vacuum.sync('./serialport.win32-ia32.node.exe.node');
utils.vacuum.sync('./serialport.win32-ia32.node.exe.node');
utils.vacuum.sync('./serialport.win32-x64.node.exe.node');
utils.vacuum.sync('./serialport.win32-ia32.test-output.exe.node');
utils.vacuum.sync('./serialport.win32-x64.test-output.exe.node');
