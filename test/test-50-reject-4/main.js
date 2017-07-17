#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = 'node4';
const inputs = { index: './test-x-index.js', warmup: './test-x-warmup.js' };
const output = './run-time/test-output.exe';

utils.mkdirp.sync(path.dirname(output));

utils.pkg.sync([
  '--target', target,
  '--output', output, inputs.warmup // fetch this particular node version
], { stdio: [ 'inherit', 'inherit', 'pipe' ] });

let right = utils.pkg.sync([
  '--target', target,
  '--output', output, inputs.index
], { stdio: 'pipe' });

assert(right.stdout.indexOf('\x1B\x5B') < 0, 'colors detected');
assert(right.stdout.indexOf('Warning') >= 0);
assert(right.stdout.indexOf(target) >= 0);
utils.vacuum.sync(path.dirname(output));
