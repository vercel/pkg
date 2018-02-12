#!/usr/bin/env node

'use strict';

const assert = require('assert');
const path = require('path');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './test-x-index.js';
const output = './test-output.exe';
const standard = 'stdout';

let right;

const inspect = (standard === 'stdout')
  ? [ 'inherit', 'pipe', 'inherit' ]
  : [ 'inherit', 'inherit', 'pipe' ];

right = utils.pkg.sync([
  '--permissive',
  '--target', target,
  '--output', output, input
], inspect);

right = right.split('\n').filter(function (line) {
  return (line.indexOf(' [debug] ') >= 0) ||
         (line.indexOf(' Warning ') >= 0);
}).filter(function (line) {
  return (line.indexOf('Targets:') < 0) &&
         (line.indexOf('added to queue') < 0) &&
         (line.indexOf('was included') < 0);
}).map(function (line) {
  if (line.indexOf('Cannot find module') >= 0) {
    return line.split(' from ')[0];
  } else return line;
}).join('\n') + '\n';

assert.equal(right,
  '> Warning Permissive flag enabled, about to ignore licenses in package.json\n' +
  '> Warning Entry \'main\' not found in %1\n');

utils.vacuum.sync(output);
