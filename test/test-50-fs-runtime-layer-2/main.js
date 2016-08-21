#!/usr/bin/env node

/* eslint-disable no-bitwise */

'use strict';

let path = require('path');
let assert = require('assert');
let utils = require('../../utils.js');
let enclose = require('../../').exec;

assert(!module.parent);
assert(__dirname === process.cwd());

let flags = process.argv.slice(2);
let a2o = require('../../').argsToObject;
let input = './test-x-index.js';
let output = './run-time/test-output.exe';

// see readFromTheBox "NODE_VERSION_MAJOR"

function bitty (version) {
  return (2 * (/^v?4./.test(version))) |
         (2 * (/^v?5./.test(version))) |
         (4 * (/^v?6./.test(version)));
}

let version1 = process.version;
let version2 = a2o(flags).version;
if (bitty(version1) !== bitty(version2)) return;

let left, right;
utils.mkdirp.sync(path.dirname(output));

left = utils.spawn.sync(
  'node', [ path.basename(input) ],
  { cwd: path.dirname(input) }
);

enclose.sync(flags.concat([
  '--output', output, input
]));

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(left, right);
utils.vacuum.sync(path.dirname(output));
