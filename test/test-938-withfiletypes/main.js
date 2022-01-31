#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './read.js';
const output = './run-time/test-output.exe';

utils.mkdirp.sync(path.dirname(output));
utils.pkg.sync(['--target', target, '--output', output, '.']);

let right;
right = utils.spawn.sync(output, [], {
  cwd: path.dirname(input),
});

assert.strictEqual('ok\n', right);
utils.vacuum.sync(path.dirname(output));
