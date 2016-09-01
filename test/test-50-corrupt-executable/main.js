#!/usr/bin/env node

'use strict';

if (process) return; // TODO ENABLE

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'latest';
const input = './test-x-index.js';
const output = './test-output.exe';

const version = target;
if (/^v?0/.test(version)) return;

let right;

utils.pkg.sync([
  '--target', target,
  '--output', output, input
]);

const spoiler = fs.readFileSync(output);
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
