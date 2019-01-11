#!/usr/bin/env node

'use strict';

const assert = require('assert');
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
  '--debug',
  '--target', target,
  '--output', output, input
], inspect);

assert(right.indexOf('\x1B\x5B') < 0, 'colors detected');

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

assert.deepEqual(right.split('\n').slice(0, 16), [
  '> Warning Cannot resolve \'reqResSomeVar\'',
  '> [debug] Cannot resolve \'reqResSomeVarMay\'',
  '> Warning Malformed requirement for \'reqResSomeVar\'',
  '> Warning Malformed requirement for \'reqResSomeVar\'',

  '> Warning Cannot resolve \'reqSomeVar\'',
  '> [debug] Cannot resolve \'reqSomeVarMay\'',
  '> Warning Malformed requirement for \'reqSomeVar\'',
  '> Warning Malformed requirement for \'reqSomeVar\'',

  '> [debug] Cannot resolve \'tryReqResSomeVar\'',
  '> [debug] Cannot resolve \'tryReqResSomeVarMay\'',
  '> [debug] Cannot resolve \'tryReqSomeVar\'',
  '> [debug] Cannot resolve \'tryReqSomeVarMay\'',

  '> [debug] Cannot find module \'reqResSomeLit\'',
  '> [debug] Cannot find module \'reqResSomeLitMay\'',
  '> [debug] Cannot find module \'reqSomeLit\'',
  '> [debug] Cannot find module \'reqSomeLitMay\''
]);

utils.vacuum.sync(output);
