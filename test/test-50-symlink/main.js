#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

// test symlinks on unix only // TODO junction
if (process.platform === 'win32') return;

const target = process.argv[2] || 'host';
const input = './test-x-index.js';
const output = './test-output.exe';
const symlink = './test-symlink.exe';

let right;

utils.pkg.sync(['--target', target, '--output', output, input]);

fs.symlinkSync(output, symlink);

right = utils.spawn.sync('./' + path.basename(symlink), [], {
  cwd: path.dirname(symlink),
});

assert.strictEqual(right, '42\n');
utils.vacuum.sync(output);
utils.vacuum.sync(symlink);
