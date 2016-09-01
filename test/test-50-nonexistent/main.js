#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'latest';
const standard = 'stdout';

let right;

const inspect = (standard === 'stdout')
  ? [ 'inherit', 'pipe', 'inherit' ]
  : [ 'inherit', 'inherit', 'pipe' ];

right = utils.pkg.sync([
  '--debug',
  '--target', target,
  '--output', 'no-output', '12345'
], { stdio: inspect, expect: 2 });

assert(right.indexOf('\x1B\x5B') < 0, 'colors detected');

/*
// TODO restore

right = right.split('\n').filter(function (line) {
  return line.indexOf('  error  ') >= 0;
}).map(function (line) {
  return line.split('  error  ')[1];
}).join('\n') + '\n';

assert.equal(right,
  'Cannot read file, ENOENT\n'
);

assert.equal(right,
  'Cannot read file, ENOENT\n'
);
*/
