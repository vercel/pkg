#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const host = 'node' + process.version.match(/^v(\d+)/)[1];
const target = process.argv[2] || host;
const input = './test-x-index.js';
const output = './test-output.exe';

let right;

// on macos damaging the binary should happen prior to the signature
utils.pkg.sync([
  '--no-signature',
  '--target',
  target,
  '--output',
  output,
  input,
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

if (process.platform === 'darwin') {
  utils.spawn.sync(
    'codesign',
    ['--no-strict', '-fs', '-', './' + path.basename(output)],
    {
      cwd: path.dirname(output),
    }
  );
}

right = utils.spawn.sync('./' + path.basename(output), [], {
  cwd: path.dirname(output),
  stdio: 'pipe',
  expect: 1,
});

assert.strictEqual(right.stdout, '');
assert(
  right.stderr.indexOf('Invalid') >= 0 ||
    right.stderr.indexOf('ILLEGAL') >= 0 ||
    right.stderr.indexOf('SyntaxError') >= 0
);
utils.vacuum.sync(output);
