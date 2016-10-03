#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

// linux may not have multiarch installed
if (process.platform === 'linux') return;

const opposite = { x64: 'x86',
  x86: 'x64', ia32: 'x64' };

const target = opposite[process.arch];
const input = './test-x-index.js';
const output = './test-output.exe';

let right;

utils.pkg.sync([
  '--target', target,
  '--output', output, input
]);

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(right, '42\n');
utils.vacuum.sync(output);
