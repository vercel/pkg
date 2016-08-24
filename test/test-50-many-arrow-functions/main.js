#!/usr/bin/env node

'use strict';

if (process) return; // TODO ENABLE

let path = require('path');
let assert = require('assert');
let utils = require('../utils.js');
let a2o = require('../../').argsToObject;

assert(!module.parent);
assert(__dirname === process.cwd());

let target = process.argv[2];
let input = './test-x-index.js';
let output = './test-output.exe';

let arch = process.arch;
if (arch === 'arm') return;
let version1 = process.version;
if (/^v?0.12/.test(version1)) return;
let version2 = a2o(flags).version;
if (/^v?0.12/.test(version2)) return;

let left, right;

left = utils.spawn.sync(
  'node', [ path.basename(input) ],
  { cwd: path.dirname(input) }
);

utils.pkg.sync([
  '--target', target,
  '--output', output, input
]);

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(left, right);
utils.vacuum.sync(output);
