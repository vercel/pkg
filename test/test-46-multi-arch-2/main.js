#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

if (function () {
  // testing armv7-to-armv6 crosscompilation
  if (process.platform === 'linux' && process.arch === 'arm') return false;
  // TODO what about armv8? we need to distingish host arch
  // armv6/armv7/armv8 - not just 'arm' we have now
  // linux may not have multiarch installed
  if (process.platform === 'linux') return true;
  return false;
}()) return;

const opposite = { x64: 'x86',
  x86: 'x64', ia32: 'x64', arm: 'armv6' };

const target = opposite[process.arch];
const input = './test-x-index.js';
const output = './test-output.exe';

let right;

utils.pkg.sync([
  '--target', target,
  '--output', output, input
], { stdio: 'inherit' });

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(right, '42\n');
utils.vacuum.sync(output);
