#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');
const path = require('path');

assert(!module.parent);
assert(__dirname === process.cwd());

if (process.platform !== 'win32') {
  console.log('Skipping this test on non-windows platform.');
  return 0;
}

const input = path.join(__dirname, '/index.js');
const output = path.join(__dirname, '/index.exe');

// build executable
utils.pkg.sync(['--debug', '--target', 'host', '--output', output, input]);

const log = utils.spawn.sync(output, ['launch'], { expect: 0 });

assert(log.includes('launch'));
assert(log.includes('stop'));

utils.vacuum.sync(output);
