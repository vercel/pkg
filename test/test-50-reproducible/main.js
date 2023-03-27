#!/usr/bin/env node

'use strict';

const fs = require('fs');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './test-x-index.js';
const output1 = './test-output-1.exe';
const output2 = './test-output-2.exe';

// v8 introduced random bits in snapshots
// version 6.0 (nodejs 8.3.0)
// TODO make v8 nullify pointers upon serializing

utils.pkg.sync([
  '--public',
  '--no-signature', // the signature will make the build not reproducible
  '--no-bytecode',
  '--target',
  target,
  '--output',
  output1,
  input,
]);

utils.pkg.sync([
  '--public',
  '--no-signature',
  '--no-bytecode',
  '--target',
  target,
  '--output',
  output2,
  input,
]);

const content1 = fs.readFileSync(output1);
const content2 = fs.readFileSync(output2);
assert.strictEqual(Buffer.compare(content1, content2), 0);
utils.vacuum.sync(output1);
utils.vacuum.sync(output2);
