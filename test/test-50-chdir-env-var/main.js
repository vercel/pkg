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

let right;

utils.pkg.sync(['--target', target, '--output', output, input], {
  env: {
    CHDIR: 'source',
    PATH: process.env.PATH,
  },
});

right = utils.spawn.sync('./' + path.basename(output), [], {
  cwd: path.dirname('source/' + output),
});

assert.strictEqual(right, 'ok\n');
utils.vacuum.sync(path.dirname('source/' + output));
