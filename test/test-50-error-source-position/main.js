#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const host = 'node' + process.version[1];
const target = process.argv[2] || host;
const input = './test-x-index.js';
const output = './test-output.exe';

let right;

utils.pkg.sync([
  '--public',
  '--target', target,
  '--output', output, input
]);

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output),
    stdio: 'pipe', expect: 1 }
);

if (!(/^(node|v)?0/.test(target))) {
  assert(right.stderr.indexOf('x.parse is not a function') >= 0);
}

const errorPointer = 'x.parse();' + require('os').EOL + '  ^';
assert(right.stderr.indexOf(errorPointer) >= 0);
utils.vacuum.sync(output);
