#!/usr/bin/env node

'use strict';

const path = require('path');
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
  '--target', target,
  '--loglevel', 'info',
  '--output', output, input
], inspect);

assert(right.indexOf('\x1B\x5B') < 0, 'colors detected');

const mappy = {};

right = right.split('\n');
right.some(function (line, index) {
  if ((line.indexOf('Cannot resolve') >= 0) ||
      (line.indexOf('The file was included') >= 0)) {
    let name = path.basename(right[index - 1]);
    if (right[index].indexOf('  warning  ') >= 0) name += ' (w)';
    let value = right[index].split(' as ')[1] || '';
    value = value || right[index].split('  warning  ')[1];
    if (mappy[name]) assert.equal(mappy[name], value);
    mappy[name] = value;
  }
});

const lines = Object.keys(mappy).sort().map(function (key) {
  return key + ' = ' + mappy[key];
}).join('\n') + '\n';

assert.equal(lines,
  'connect.js = DISCLOSED code\n' +
  'has-no-license.js = enclosed code\n' +
  'has-no-license.js (w) = Cannot resolve \'hasNoLicenseNonLiteral\'\n' +
  'has-permissive-license.js = DISCLOSED code\n' +
  'has-permissive-license.js (w) = Cannot resolve \'hasPermissiveLicenseNonLiteral\'\n' +
  'has-strict-license.js = enclosed code\n' +
  'has-strict-license.js (w) = Cannot resolve \'hasStrictLicenseNonLiteral\'\n' +
  'package.json = DISCLOSED code\n' +
  'test-x-index.js = enclosed code\n'
);

utils.vacuum.sync(output);
