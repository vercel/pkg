#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './copy.js';
const output = './output/test-output.exe';

utils.mkdirp.sync(path.dirname(output));
utils.pkg.sync(['--target', target, '--output', output, '.']);

let left, right;
left = utils.spawn.sync('node', [path.basename(input)], {
  cwd: path.dirname(input),
});

right = utils.spawn.sync(output, [], {
  cwd: path.dirname(input),
});

assert.strictEqual(left, right);
utils.vacuum.sync(path.dirname(output));
utils.vacuum.sync(path.join(__dirname, '/*sync.json'));
