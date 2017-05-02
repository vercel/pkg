#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const windows = process.platform === 'win32';

function rnd () {
  return Math.random().toString().slice(-6);
}

const pairs = [
  { input: './test-cluster.js',
    output: './run-time/test-output-' + rnd() + '.exe' },
  { input: './test-cpfork-1.js',
    output: './run-time/test-output-' + rnd() + '.exe' },
  { input: './test-cpfork-2.js',
    output: './run-time/test-output-' + rnd() + '.exe' },
  { input: './test-cpforkext-1.js',
    output: './test-output-' + rnd() + '.exe' },
  { input: './test-cpforkext-2.js',
    output: './test-output-' + rnd() + '.exe' },
  { input: './test-spawnexp-1.js',
    output: './run-time/test-output-' + rnd() + '.exe' },
  { input: './test-spawnexp-2.js',
    output: './run-time/test-output-' + rnd() + '.exe' }
];

if (!windows) {
  pairs.push(
    { input: './test-spawn-1.js',
      output: './run-time/test-output-' + rnd() + '.exe' },
    { input: './test-spawn-2.js',
      output: './run-time/test-output-' + rnd() + '.exe' }
  );
}

function chmodPlusX (file) {
  const stat = fs.statSync(file);
  const plusx = (stat.mode | 64 | 8).toString(8).slice(-3);
  fs.chmodSync(file, plusx);
}

chmodPlusX('./test-spawn-1.js');
chmodPlusX('./test-spawn-2.js');

function stripTraceOpt (lines) {
  return lines.split('\n').filter(function (line) {
    return (line.indexOf('[disabled optimization') < 0) &&
           (line.indexOf('[marking') < 0) &&
           (line.indexOf('[compiling method') < 0) &&
           (line.indexOf('[optimizing') < 0) &&
           (line.indexOf('[completed optimizing') < 0) &&
           (line.indexOf('einfo:') < 0);
  }).join('\n');
}

pairs.some(function (pair) {
  const input = pair.input;
  const output = pair.output;

  let left, right;
  utils.mkdirp.sync(path.dirname(output));

  left = utils.spawn.sync(
    'node', [ path.basename(input) ],
    { cwd: path.dirname(input) }
  );

  utils.pkg.sync([
    '--target', target,
    '--output', output, input
  ]);

  right = utils.spawn.sync(
    './' + path.basename(output), [],
    { cwd: path.dirname(output) }
  );

  right = stripTraceOpt(right);
  left = stripTraceOpt(left);
  assert.equal(left, right);
  utils.vacuum.sync('run-time');
  utils.vacuum.sync(output);
});
