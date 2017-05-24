#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const host = 'node' + process.version[1];
const target = process.argv[2] || host;
const windows = process.platform === 'win32';
const input = './test-x-index.js';
const output = './run-time/test-output.exe';

if (!windows) return;
const arch = process.arch; // TODO extract arch from `target` once it contains
if (arch !== 'x64') return;
const version1 = process.version;
if (!(/^(node|v)?4/.test(version1))) return;
const version2 = target;
if (!(/^(node|v)?4/.test(version2))) return;

let left, right;
utils.mkdirp.sync(path.dirname(output));

fs.writeFileSync(
  path.join(path.dirname(output), 'time.node'),
  fs.readFileSync('./time.node')
);

left = utils.spawn.sync(
  'node', [ path.basename(input) ],
  { cwd: path.dirname(input) }
);

utils.pkg.sync([
  '--target', target,
  '--output', output, input
]);

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(left, right);
utils.vacuum.sync(path.dirname(output));
