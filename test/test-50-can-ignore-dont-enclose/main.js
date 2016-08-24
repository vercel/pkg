#!/usr/bin/env node

'use strict';

if (process) return; // TODO ENABLE

let assert = require('assert');
let utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

let target = process.argv[2];
let input = './test-x-index.js';
let output = './test-output.exe';
let standard = 'stdout';

let right;

let inspect = (standard === 'stdout')
  ? [ 'inherit', 'pipe', 'inherit' ]
  : [ 'inherit', 'inherit', 'pipe' ];

right = utils.pkg.sync([
  '--target', target,
  '--loglevel', 'info',
  '--output', output, input
], inspect);

assert(right.indexOf('\x1B\x5B') < 0, 'colors detected');

right = right.split('\n').filter(function (line) {
  return (line.indexOf('  info  ') >= 0) ||
         (line.indexOf('  warning  ') >= 0);
}).filter(function (line) {
  return line.indexOf('was included') < 0;
}).map(function (line) {
  if (line.indexOf('Cannot find module') >= 0) {
    return line.split(' from ')[0];
  } else return line;
}).join('\n') + '\n';

assert.equal(right,
  '  info  Cannot resolve \'some_v\'\n' +
  '  info  Cannot resolve \'some_v_ci\'\n' +
  '  info  Cannot resolve \'some_v\'\n' +
  '  info  Cannot resolve \'some_v_ci\'\n' +
  '  warning  Cannot resolve \'some_v\'\n' +
  '  info  Cannot resolve \'some_v_ci\'\n' +
  '  warning  Malformed requirement: require.resolve(some_v, some_v)\n' +
  '  warning  Malformed requirement: require.resolve(some_v, "can-can")\n' +
  '  warning  Cannot resolve \'some_v\'\n' +
  '  info  Cannot resolve \'some_v_ci\'\n' +
  '  warning  Malformed requirement: require(some_v, some_v)\n' +
  '  warning  Malformed requirement: require(some_v, "can-can")\n' +
  '  info  Cannot find module \'some-s\'\n' +
  '  info  Cannot find module \'some-s-ci\'\n' +
  '  info  Cannot find module \'some-s\'\n' +
  '  info  Cannot find module \'some-s-ci\'\n'
);

utils.vacuum.sync(output);
