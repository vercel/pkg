#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';
const input = './test-x-index.js';
const output = './run-time/test-output.exe';

let right;
utils.mkdirp.sync(path.dirname(output));
utils.mkdirp.sync(path.join(path.dirname(output), 'plugins-D-ext'));

fs.writeFileSync(
  path.join(path.dirname(output), 'plugins-D-ext/test-y-require-D.js'),
                fs.readFileSync('./plugins-D-ext/test-y-require-D.js')
);

utils.pkg.sync([
  '--target', target,
  '--output', output, input
]);

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(right,
  'I am C\n' +
  'I am D\n' +
  'test-x-index.js\n' +
  'test-y-common.js\n' +
  'plugins-C-int\n' +
  'plugins-D-ext\n'
);

utils.vacuum.sync(path.dirname(output));
