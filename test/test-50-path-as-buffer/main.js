#!/usr/bin/env node

/* eslint-disable no-multi-spaces */

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

function bitty(version) {
  return (
    (2 * /^(node|v)?4/.test(version)) |
    (2 * /^(node|v)?5/.test(version)) |
    (2 * /^(node|v)?6/.test(version)) |
    (2 * /^(node|v)?7/.test(version)) |
    (2 * /^(node|v)?8/.test(version)) | // 2 = doesn't have URL
    (4 * /^(node|v)?9/.test(version)) |
    (4 * /^(node|v)?10/.test(version)) |
    (4 * /^(node|v)?11/.test(version)) |
    (4 * /^(node|v)?12/.test(version)) |
    (4 * /^(node|v)?13/.test(version)) |
    (4 * /^(node|v)?14/.test(version)) |
    (4 * /^(node|v)?16/.test(version))
  ); // 4 = has URL
}

const version1 = process.version;
const version2 = target;
if (bitty(version1) !== bitty(version2)) return;

let left, right;

left = utils.spawn.sync('node', [path.basename(input)], {
  cwd: path.dirname(input),
});

utils.pkg.sync(['--target', target, '--output', output, input]);

right = utils.spawn.sync('./' + path.basename(output), [], {
  cwd: path.dirname(output),
});

assert.strictEqual(left, right);
utils.vacuum.sync(output);
