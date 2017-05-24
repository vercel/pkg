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
const input = './test-x-index.js';
const output = './test-output.exe';

const version = target;
if (/^(node|v)?0/.test(version)) return;

let right;

utils.pkg.sync([
  '--target', target,
  '--output', output, input
]);

const damage = fs.readFileSync(output);
const boundary = 4096;
damage[damage.length - boundary - 10] += 1;
damage[damage.length - boundary + 10] -= 1;
fs.writeFileSync(output, damage);

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output),
    stdio: 'pipe', expect: 1 }
);

assert.equal(right.stdout, '');
assert(right.stderr.indexOf('CHECKSUM_MISMATCH') >= 0);
utils.vacuum.sync(output);
