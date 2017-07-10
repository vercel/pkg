#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const host = 'node' + process.version[1];
const target = process.argv[2] || host;
const input = './test-x-index.js';
const output = './run-time/test-output.exe';

if (!(/^(node|v)?7/.test(target))) return;

let right;
utils.mkdirp.sync(path.dirname(output));

utils.pkg.sync([
  '--target', target,
  '--options', 'harmony-async-await',
  '--output', output, input
], { stdio: 'inherit' });

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(right, '42\n');
utils.vacuum.sync(path.dirname(output));
