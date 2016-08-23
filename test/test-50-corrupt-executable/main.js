#!/usr/bin/env node

'use strict';

return; // TODO
/* eslint-disable no-unreachable */

let fs = require('fs');
let path = require('path');
let assert = require('assert');
let utils = require('../../utils.js');
let enclose = require('../../').exec;
let a2o = require('../../').argsToObject;

assert(!module.parent);
assert(__dirname === process.cwd());

let flags = process.argv.slice(2);
let input = './test-x-index.js';
let output = './test-output.exe';

let version = a2o(flags).version;
if (/^v?0.12./.test(version)) return;

let right;

enclose.sync(flags.concat([
  '--output', output, input
]));

let spoiler = fs.readFileSync(output);
spoiler[spoiler.length - 100] += 1;
spoiler[spoiler.length - 120] -= 1;
fs.writeFileSync(output, spoiler);

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output),
    stdio: 'super-pipe', expect: 2 }
);

assert.equal(right.stdout, '');
assert.equal(right.stderr, 'Corrupt executable\n');
utils.vacuum.sync(output);
