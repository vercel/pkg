#!/usr/bin/env node

'use strict';

if (process) return; // TODO ENABLE

let path = require('path');
let assert = require('assert');
let utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

let target = process.argv[2];
let input = './test-x-index.js';
let output = './test-output.exe';

let version = target;
if (/^v?0.12/.test(version)) return;
if (/^v?4/.test(version)) return;

let right;

utils.pkg.sync([
  '--target', target,
  '--output', output, input
]);

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(right, 'ok\n');
utils.vacuum.sync(output);
