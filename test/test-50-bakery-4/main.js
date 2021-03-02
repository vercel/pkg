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

if (/^(node|v)?0/.test(target)) return;
if (/^(node|v)?4/.test(target)) return;
if (/^(node|v)?6/.test(target)) return;
if (/^(node|v)?8/.test(target)) return;

let left;
utils.mkdirp.sync(path.dirname(output));

left = utils.spawn.sync(
  'node', [ '--v8-options' ],
  { cwd: path.dirname(input) }
);

for (const option of [ 'v8-options', 'v8_options' ]) {
  let right;

  utils.pkg.sync([
    '--target', target,
    '--options', option,
    '--output', output, input
  ]);

  right = utils.spawn.sync(
    './' + path.basename(output), [],
    { cwd: path.dirname(output) }
  );

  assert(left.indexOf('--expose_gc') >= 0 ||
         left.indexOf('--expose-gc') >= 0);
  assert(right.indexOf('--expose_gc') >= 0 ||
         right.indexOf('--expose-gc') >= 0);
}

utils.vacuum.sync(path.dirname(output));
