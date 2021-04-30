#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './test-x-index.js';
const output = './test-output.exe';

process.env.NODE_OPTIONS = '--max-old-space-size=777';

utils.pkg.sync(['--bytecode', '--target', target, '--output', output, input]);

utils.spawn.sync(output, [], { expect: 4 });

utils.vacuum.sync(output);

utils.pkg.sync([
  '--public',
  '--public-packages=*',
  '--no-bytecode',
  '--target',
  target,
  '--output',
  output,
  input,
]);

utils.spawn.sync(output, []);

utils.vacuum.sync(output);
