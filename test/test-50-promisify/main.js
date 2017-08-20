#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const host = 'node' + process.version.match(/^v(\d+)/)[1];
const target = process.argv[2] || host;
const input = './test-x-index.js';
const output = './test-output.exe';

const version1 = process.version.match(/^v(\d+)/)[1];
const version2 = target.match(/^node(\d+)/)[1];
if (version1 !== version2) return;

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
