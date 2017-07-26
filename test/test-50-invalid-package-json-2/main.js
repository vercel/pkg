#!/usr/bin/env node

'use strict';

const assert = require('assert');
const path = require('path');
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
assert(right.indexOf('Warning') >= 0);
assert(right.indexOf('Entry \'main\' not found') >= 0);
assert(right.indexOf('crusader' + path.sep + 'package.json') >= 0);

utils.vacuum.sync(output);
