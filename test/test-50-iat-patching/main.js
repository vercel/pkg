#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'latest';
const input = './test-x-index.js';
const output = './test-output.exe';

let left, right;

left = utils.spawn.sync(
  'node', [ path.basename(input) ],
  { cwd: path.dirname(input) }
);

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
utils.vacuum.sync('./serialport.win32-ia32.node.exe.node');
utils.vacuum.sync('./serialport.win32-ia32.node.exe.node');
utils.vacuum.sync('./serialport.win32-x64.node.exe.node');
utils.vacuum.sync('./serialport.win32-ia32.test-output.exe.node');
utils.vacuum.sync('./serialport.win32-x64.test-output.exe.node');
