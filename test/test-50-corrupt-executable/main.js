#!/usr/bin/env node

'use strict';

if (process) return; // TODO ENABLE

let fs = require('fs');
let path = require('path');
let assert = require('assert');
let utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

let target = process.argv[2];
let input = './test-x-index.js';
let output = './test-output.exe';

let version = target;
if (/^v?0.12/.test(version)) return;

let right;

utils.pkg.sync([
  '--target', target,
  '--output', output, input
]);

let spoiler = fs.readFileSync(output);
spoiler[spoiler.length - 100] += 1;
spoiler[spoiler.length - 120] -= 1;
fs.writeFileSync(output, spoiler);

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output),
    stdio: 'pipe', expect: 2 }
);

assert.equal(right.stdout, '');
assert.equal(right.stderr, 'Corrupt executable\n');
utils.vacuum.sync(output);
