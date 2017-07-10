#!/usr/bin/env node

'use strict';

const fs = require('fs');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './test-x-index.js';
const output = './test-output.exe';
const standard = 'stdout';

let left, right;

left = fs.readFileSync(
  input, 'utf8'
).split('\n').filter(function (line) {
  return line.indexOf('/**/') >= 0;
}).map(function (line) {
  return line.split('/**/')[1];
}).join('\n') + '\n';

const inspect = (standard === 'stdout')
  ? [ 'inherit', 'pipe', 'inherit' ]
  : [ 'inherit', 'inherit', 'pipe' ];

right = utils.pkg.sync([
  '--debug',
  '--target', target,
  '--output', output, input
], inspect);

assert(right.indexOf('\x1B\x5B') < 0, 'colors detected');

const rightLines = [];
right.split('\n').some(function (line) {
  let s = line.split('Cannot resolve \'')[1];
  if (s) {
    rightLines.push(s.slice(0, -(')').length));
    return;
  }
  s = line.split('Path.resolve(')[1];
  if (s) {
    rightLines.push(s.slice(0, -(') is ambiguous').length));
  }
});

right = rightLines.join('\n') + '\n';
assert.equal(left, right);
utils.vacuum.sync(output);
