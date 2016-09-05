#!/usr/bin/env node

'use strict';

const fs = require('fs');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'latest';
const input = './test-x-index.js';
const newcomers = [ './test-output.exe' ];

for (const newcomer of newcomers) {
  assert(!fs.existsSync(newcomer));
}

utils.pkg.sync([
  '--target', target,
  '--output', newcomers[0], input
]);
process.exit(0);
for (const newcomer of newcomers) {
  assert(fs.existsSync(newcomer));
  utils.vacuum.sync(newcomer);
}
