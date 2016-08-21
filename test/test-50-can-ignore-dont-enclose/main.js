#!/usr/bin/env node

'use strict';

let assert = require('assert');
let utils = require('../../utils.js');
let enclose = require('../../').exec;

assert(!module.parent);
assert(__dirname === process.cwd());

let flags = process.argv.slice(2);
let a2o = require('../../').argsToObject;
let o2a = require('../../').objectToArgs;
let input = './test-x-index.js';
let output = './test-output.exe';
let standard = 'stdout';

let argo = a2o(flags);
argo.loglevel = 'info';
flags = o2a(argo);

let right;

let inspect = (standard === 'stdout')
  ? [ 'inherit', 'pipe', 'inherit' ]
  : [ 'inherit', 'inherit', 'pipe' ];

let c = enclose.sync(flags.concat([
  '--output', output, input
]), inspect);

right = c[standard].toString();
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
