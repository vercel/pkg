#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const output = './test-output.exe';
const standard = 'stdout';

let right;

const inspect =
  standard === 'stdout'
    ? ['inherit', 'pipe', 'inherit']
    : ['inherit', 'inherit', 'pipe'];

right = utils.pkg.sync(['--target', target, '--output', output, '.'], inspect);

assert(right.indexOf('\x1B\x5B') < 0, 'colors detected');
assert(right.indexOf("Non-javascript file is specified in 'scripts'") >= 0);
assert(right.indexOf('animate.css') >= 0);
utils.vacuum.sync(output);
