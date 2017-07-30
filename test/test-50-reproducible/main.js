#!/usr/bin/env node

'use strict';

const fs = require('fs');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './test-x-index.js';
const output1 = './test-output.exe';
const output2 = './test-output.exe';

utils.pkg.sync([
  '--target', target,
  '--output', output1, input
]);

utils.pkg.sync([
  '--target', target,
  '--output', output2, input
]);

const content1 = fs.readFileSync(output1);
const content2 = fs.readFileSync(output2);
assert.equal(Buffer.compare(content1, content2), 0);
utils.vacuum.sync(output1);
utils.vacuum.sync(output2);
