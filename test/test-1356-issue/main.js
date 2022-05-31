#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');
const path = require('path');

assert(!module.parent);
assert(__dirname === process.cwd());
const target = 'host';
if (process.platform !== 'win32') {
  console.log('Skipping this test on non windows platform');
  return 0;
}

utils.pkg.sync(
  [
    '--target',
    target,
    '--compress',
    'None',
    '--output',
    path.join(__dirname, 'test.exe'),
    './test.js',
  ],
  { expect: 0 }
);

const result_ok = utils.spawn.sync(path.join(__dirname, 'test.exe'), [], {
  stdio: ['pipe', 'pipe', 'pipe'],
});
assert.strictEqual(result_ok.stderr, '');
assert.strictEqual(
  result_ok.stdout,
  'CHILD SPAWNED SUCCESS\nCHILD SPAWNED SUCCESS\nCHILD SPAWNED SUCCESS\n'
);
