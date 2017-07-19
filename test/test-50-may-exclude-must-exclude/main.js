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

assert.equal(right,
  '> Warning Cannot resolve \'reqResSomeVar\'\n' +
  '> [debug] Cannot resolve \'reqResSomeVarMay\'\n' +
  '> Warning Malformed requirement for \'reqResSomeVar\'\n' +
  '> Warning Malformed requirement for \'reqResSomeVar\'\n' +

  '> Warning Cannot resolve \'reqSomeVar\'\n' +
  '> [debug] Cannot resolve \'reqSomeVarMay\'\n' +
  '> Warning Malformed requirement for \'reqSomeVar\'\n' +
  '> Warning Malformed requirement for \'reqSomeVar\'\n' +

  '> [debug] Cannot resolve \'tryReqResSomeVar\'\n' +
  '> [debug] Cannot resolve \'tryReqResSomeVarMay\'\n' +
  '> [debug] Cannot resolve \'tryReqSomeVar\'\n' +
  '> [debug] Cannot resolve \'tryReqSomeVarMay\'\n' +

  '> [debug] Cannot find module \'reqResSomeLit\'\n' +
  '> [debug] Cannot find module \'reqResSomeLitMay\'\n' +
  '> [debug] Cannot find module \'reqSomeLit\'\n' +
  '> [debug] Cannot find module \'reqSomeLitMay\'\n'
);

utils.vacuum.sync(output);
