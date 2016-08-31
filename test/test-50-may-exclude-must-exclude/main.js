#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2];
const input = './test-x-index.js';
const output = './test-output.exe';
const standard = 'stdout';

let right;

const inspect = (standard === 'stdout')
  ? [ 'inherit', 'pipe', 'inherit' ]
  : [ 'inherit', 'inherit', 'pipe' ];

right = utils.pkg.sync([
  '--debug',
  '--target', target,
  '--output', output, input
], inspect);

assert(right.indexOf('\x1B\x5B') < 0, 'colors detected');

right = right.split('\n').filter(function (line) {
  return (line.indexOf(' [debug] ') >= 0) ||
         (line.indexOf(' Warning ') >= 0);
}).filter(function (line) {
  return line.indexOf('was included') < 0;
}).map(function (line) {
  if (line.indexOf('Cannot find module') >= 0) {
    return line.split(' from ')[0];
  } else return line;
}).join('\n') + '\n';

assert.equal(right,
  '> Warning Cannot resolve \'rr_some_v\'\n' +
  '> [debug] Cannot resolve \'rr_some_v_ci\'\n' +
  '> Warning Malformed requirement \'rr_some_v\'\n' +
  '> Warning Malformed requirement \'rr_some_v\'\n' +

  '> Warning Cannot resolve \'r_some_v\'\n' +
  '> [debug] Cannot resolve \'r_some_v_ci\'\n' +
  '> Warning Malformed requirement \'r_some_v\'\n' +
  '> Warning Malformed requirement \'r_some_v\'\n' +

  '> [debug] Cannot resolve \'try_rr_some_v\'\n' +
  '> [debug] Cannot resolve \'try_rr_some_v_ci\'\n' +
  '> [debug] Cannot resolve \'try_r_some_v\'\n' +
  '> [debug] Cannot resolve \'try_r_some_v_ci\'\n' +

  '> [debug] Cannot find module \'rr-some-s\'\n' +
  '> [debug] Cannot find module \'rr-some-s-ci\'\n' +
  '> [debug] Cannot find module \'r-some-s\'\n' +
  '> [debug] Cannot find module \'r-some-s-ci\'\n'
);

utils.vacuum.sync(output);
