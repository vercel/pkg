#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './test-x-index.js';
const output = './run-time/test-output.exe';

if (process.arch === 'arm') return;

let left, right;
utils.mkdirp.sync(path.dirname(output));

left = utils.spawn.sync(
  'node', [ path.basename(input) ],
  { cwd: path.dirname(input) }
);

utils.pkg.sync([
  '--target', target,
  '--config', './test-config.js',
  '--output', output, input
]);

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

left = left.split('\n');
right = right.split('\n');
// right may have less lines, premature exit,
// less trusted, so using left.length here
for (let i = 0; i < left.length; i += 1) {
  if (left[i] !== right[i]) {
    console.log('line', i);
    console.log('<<left<<\n' + left);
    console.log('>>right>>\n' + right);
    throw new Error('Assertion');
  }
}

utils.vacuum.sync(path.dirname(output));
