#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './test-x-index.js';
const output = './test-output.exe';

let right;
utils.mkdirp.sync(path.dirname(output));

utils.pkg.sync([
  '--target', target,
  '--output', output, input
]);

right = utils.spawn.sync(output, [ '42' ], {});
assert.equal(right, '42\n');
right = utils.spawn.sync(output, [ '-ft' ], {});
assert.equal(right, '-ft\n');
right = utils.spawn.sync(output, [ '--fourty-two' ], {});
assert.equal(right, '--fourty-two\n');
utils.vacuum.sync(output);
