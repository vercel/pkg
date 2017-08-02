#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './test-x-index.js';
const output = './test-output.exe';
const standard = 'stdout';

let right;

const inspect = (standard === 'stdout')
  ? [ 'inherit', 'pipe', 'inherit' ]
  : [ 'inherit', 'inherit', 'pipe' ];

right = utils.pkg.sync([
  '--target', target,
  '--output', output, input
], inspect);

assert(right.indexOf('\x1B\x5B') < 0, 'colors detected');
right = right.replace(/\\/g, '/');
assert(right.indexOf('test-50-cannot-include-addon/time.node') >= 0);
assert(right.indexOf('path-to-executable/time.node') >= 0);
utils.vacuum.sync(output);
