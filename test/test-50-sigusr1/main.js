#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const windows = process.platform === 'win32';
const input = './test-x-index.js';
const output = './test-output.exe';

if (windows) return;

let right;

utils.pkg.sync(['--target', target, '--output', output, input]);

right = utils.spawn.sync('./' + path.basename(output), [], { expect: null });

assert.strictEqual(right, 'ok\n');
utils.vacuum.sync(output);
