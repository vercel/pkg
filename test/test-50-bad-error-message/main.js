#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './test-x-index';
const output = './test-output.exe';

let right;

utils.pkg.sync([
  '--target', target,
  '--config', './test-config.js',
  '--output', output, input
]);

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output),
    stdio: 'pipe', expect: 1 }
);

assert(right.stderr.indexOf('x.parse is not a function') >= 0);
utils.vacuum.sync(output);
