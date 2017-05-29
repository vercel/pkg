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

if (/^(node|v)?0/.test(target)) return;

let right;

utils.pkg.sync([
  '--target', target,
  '--output', output, input
]);

const damage = fs.readFileSync(output);
const boundary = 4096;
damage[damage.length - 2 * boundary - 10] = 0x2;
damage[damage.length - 3 * boundary - 10] = 0x2;
damage[damage.length - 4 * boundary - 10] = 0x2;
damage[damage.length - 2 * boundary + 10] = 0x2;
damage[damage.length - 3 * boundary + 10] = 0x2;
damage[damage.length - 4 * boundary + 10] = 0x2;
fs.writeFileSync(output, damage);

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output),
    stdio: 'pipe', expect: 1 }
);

assert.equal(right.stdout, '');
assert((right.stderr.indexOf('Invalid') >= 0) ||
       (right.stderr.indexOf('ILLEGAL') >= 0) ||
       (right.stderr.indexOf('SyntaxError') >= 0));
utils.vacuum.sync(output);
