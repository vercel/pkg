#!/usr/bin/env node

let fs = require('fs');
let path = require('path');
let assert = require('assert');
let utils = require('../../utils.js');
let enclose = require('../../').exec;

assert(!module.parent);
assert(__dirname === process.cwd());

let flags = process.argv.slice(2);
let windows = process.platform === 'win32';
let a2o = require('../../').argsToObject;
let input = './test-x-index.js';
let output = './run-time/test-output.exe';

if (!windows) return;
let arch = a2o(flags).arch;
if (arch !== 'x64') return;
let version1 = process.version;
if (!(/^v?4./.test(version1))) return;
let version2 = a2o(flags).version;
if (!(/^v?4./.test(version2))) return;

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

enclose.sync(flags.concat([
  '--output', output, input
]));

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(left, right);
utils.vacuum.sync(path.dirname(output));
