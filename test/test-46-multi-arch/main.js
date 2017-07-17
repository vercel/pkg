#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

// only linux-x64 has linux-armv7 counterpart
if (process.platform !== 'linux') return;

const opposite = { x64: 'armv7',
  x86: 'armv7', ia32: 'armv7', arm: 'x64' };

const target = opposite[process.arch];
const input = './test-x-index.js';
const output = './test-output.exe';

let right = utils.pkg.sync([
  '--target', target,
  '--output', output, input
], { stdio: 'pipe' });

assert(right.stdout.indexOf('\x1B\x5B') < 0, 'colors detected');
assert(right.stdout.indexOf('Warning') >= 0);
assert(right.stdout.indexOf(target) >= 0);
utils.vacuum.sync(output);
