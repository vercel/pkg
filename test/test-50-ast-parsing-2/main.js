#!/usr/bin/env node

'use strict';

let fs = require('fs');
let assert = require('assert');
let utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

let target = process.argv[2];
let input = './test-x-index.js';
let output = './test-output.exe';
let standard = 'stdout';

let left, right;

left = fs.readFileSync(
  input, 'utf8'
).split('\n').filter(function (line) {
  return line.indexOf('/**/') >= 0;
}).map(function (line) {
  return line.split('/**/')[1];
}).join('\n') + '\n';

let inspect = (standard === 'stdout')
  ? [ 'inherit', 'pipe', 'inherit' ]
  : [ 'inherit', 'inherit', 'pipe' ];

right = utils.pkg.sync([
  '--target', target,
  '--loglevel', 'info',
  '--output', output, input
], inspect);

assert(right.indexOf('\x1B\x5B') < 0, 'colors detected');

let rightLines = [];
right.split('\n').some(function (line) {
  let s = line.split('Cannot resolve \'')[1];
  if (s) {
    rightLines.push(s.slice(0, -(')').length));
    return;
  }
  s = line.split('Path.resolve(')[1];
  if (s) {
    rightLines.push(s.slice(0, -(') is ambiguous').length));
    return;
  }
});

right = rightLines.join('\n') + '\n';
assert.equal(left, right);
utils.vacuum.sync(output);
