#!/usr/bin/env node

'use strict';

/*
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const opposite = {
  x64: 'armv7', x86: 'armv7', ia32: 'armv7', arm: 'x64'
};

const target = opposite[process.arch];
const input = './test-x-index.js';
const standard = 'stdout';

let right;

const inspect = (standard === 'stdout')
  ? [ 'inherit', 'pipe', 'inherit' ]
  : [ 'inherit', 'inherit', 'pipe' ];

right = utils.pkg.sync([
  '--target', target,
  input
], { stdio: inspect, expect: 2 });

assert(right.indexOf('\x1B\x5B') < 0, 'colors detected');
assert(right.indexOf('Error!') >= 0);
assert(right.indexOf(target) >= 0);
*/
