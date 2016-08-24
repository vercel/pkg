#!/usr/bin/env node

'use strict';

let path = require('path');
let assert = require('assert');
let utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

let target = process.argv[2];
let input = './test-x-index.js';
let output = './test-output.exe';

let right;

utils.pkg.sync([
  '--target', target,
  '--output', output, input
]);

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(right,
  'true\n' +
  'false\n' +
  'Cannot write to packaged file\n' +
  'true\n' +
  'closed\n' +
  'false\n' +
  'Cannot write to packaged file\n' +
  'Cannot write to packaged file\n' +
  'undefined\n' +
  'Cannot write to packaged file\n' +
  'undefined\n'
);

utils.vacuum.sync(output);
