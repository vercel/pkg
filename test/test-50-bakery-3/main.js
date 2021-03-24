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

let left, right;
utils.mkdirp.sync(path.dirname(output));

left = utils.spawn.sync('node', ['--v8-options'], { cwd: path.dirname(input) });

utils.pkg.sync(['--target', target, '--output', output, input]);

right = utils.spawn.sync('./' + path.basename(output), ['--v8-options'], {
  cwd: path.dirname(output),
  env: { PKG_EXECPATH: 'PKG_INVOKE_NODEJS' },
});

assert(left.indexOf('--expose_gc') >= 0 || left.indexOf('--expose-gc') >= 0);
assert(right.indexOf('--expose_gc') >= 0 || right.indexOf('--expose-gc') >= 0);
utils.vacuum.sync(path.dirname(output));
