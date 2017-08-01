#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './test-x-index.js';
const output = './test-output.exe';
const standard = 'stdout';

function rightReducer (mappy, line, index, right) {
  if ((line.indexOf('Cannot resolve') >= 0) ||
      (line.indexOf('The file was included') >= 0)) {
    const name = path.basename(right[index + 1]);
    let value = right[index].split(' as ')[1] || '';
    value = value || right[index].split(' Warning ')[1];
    if (mappy[name]) assert.equal(mappy[name], value);
    mappy[name] = value;
  }

  return mappy;
}

for (const pub of [ false, true ]) {
  let right;

  const inspect = (standard === 'stdout')
    ? [ 'inherit', 'pipe', 'inherit' ]
    : [ 'inherit', 'inherit', 'pipe' ];

  right = utils.pkg.sync([
    '--debug',
    '--target', target,
    '--output', output, input
  ].concat(pub ? [ '--public' ] : []), inspect);

  assert(right.indexOf('\x1B\x5B') < 0, 'colors detected');

  right = right.split('\n');
  const mappy = right.reduce(rightReducer, {});

  const lines = Object.keys(mappy).sort().map(function (key) {
    return key + ' = ' + mappy[key];
  }).join('\n') + '\n';

  assert.equal(lines,
    'connect.js = DISCLOSED code (with sources)\n' +
    'has-no-license.js = bytecode (no sources)\n' +
    'has-permissive-license.js = DISCLOSED code (with sources)\n' +
    'has-strict-license.js = bytecode (no sources)\n' +
    'package.json = DISCLOSED code (with sources)\n' +
    (pub ? 'test-x-index.js = DISCLOSED code (with sources)\n' :
           'test-x-index.js = bytecode (no sources)\n')
  );

  utils.vacuum.sync(output);
}
