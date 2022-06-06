#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

// note : worker_threads in only valid for nodejs >=12.0
const MAJOR_VERSION = parseInt(process.version.match(/v([0-9]+)/)[1], 10);
if (MAJOR_VERSION < 12) {
  console.log('Ignoring test ');
  return;
}

/* eslint-disable no-unused-vars */
const input = 'package.json';
const target = 'host';
const ext = process.platform === 'win32' ? '.exe' : '';
const output = 'output' + ext;

const inspect = ['ignore', 'ignore', 'pipe'];

const logPkg1 = utils.pkg.sync(
  ['--target', target, '--debug', '--output', output, input],
  { expect: 0 }
);

const log1 = utils.spawn.sync(path.join(__dirname, output), [], {
  cwd: __dirname,
  expect: 0,
});

assert.strictEqual(
  log1,
  `Starting a
Finishing a
Starting b
Finishing b
`
);

const logPkg2 = utils.pkg.sync(
  ['--target', target, '--debug', '--output', output, 'a.js'],
  { expect: 0 }
);

const log2 = utils.spawn.sync(path.join(__dirname, output), [], {
  cwd: __dirname,
  expect: 0,
});
assert.strictEqual(
  log2,
  `Starting a
Finishing a
Starting b
Finishing b
`
);
utils.vacuum.sync(output);
