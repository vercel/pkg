#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const standard = 'stdout';

let right;

const inspect = (standard === 'stdout')
  ? [ 'inherit', 'pipe', 'inherit' ]
  : [ 'inherit', 'inherit', 'pipe' ];

right = utils.pkg.sync([
  '--target', 'node7-x6',
  '--output', 'no-output', 'test-x-index.js'
], { stdio: inspect, expect: 2 });

assert(right.indexOf('\x1B\x5B') < 0, 'colors detected');
assert(right.indexOf('Error!') >= 0);
assert(right.indexOf('node7-x6') >= 0);
assert(right.indexOf('Unknown token') >= 0);
