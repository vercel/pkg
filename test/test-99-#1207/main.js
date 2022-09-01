#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');
const path = require('path');

assert(!module.parent);
assert(__dirname === process.cwd());

if (process.platform !== 'win32') {
  console.log('Skipping this test on non windows platform');
  return 0;
}

const input = 'H:\\index.js';
const output = 'H:\\index.exe';

// mount a H drive
const thisFolder = __dirname;
try {
  utils.exec.sync(`subst H: /D`);
} catch (err) {
  /* */
}
utils.exec.sync(`subst H: ${thisFolder}`);

// build from the alternate drive
utils.pkg.sync(['--debug', '--target', 'host', '--output', output, input], {
  cwd: 'H:\\',
  // stdio: 'inherit'
});

// check that produced executable is running and produce the expected output.
// when run tom the same file it has been built on.
const log = utils.spawn.sync(output, [], {
  cwd: path.dirname(output),
  expect: 0,
});
assert(log === '42\n');

// check that produced executable is running and produce the expected output.
const logRef = utils.spawn.sync(output, [], {
  cwd: path.dirname(output),
  env: { DEBUG_PKG: 42 },
  expect: 0,
});
if (!logRef.match(/42\n$/m)) {
  console.log(logRef);
  process.exit(1);
}
// running on C while H: drive is here
const alternateOutput = path.resolve('.\\index.exe');
console.log('alternateOutput', alternateOutput);

const log1 = utils.spawn.sync(alternateOutput, [], {
  cwd: path.dirname(alternateOutput),
  env: { DEBUG_PKG: 42 },
  expect: 0,
});
assert(log1 === logRef);

// running on C while H: drive is not here anymore
utils.exec.sync(`subst H: /D`);
const log2 = utils.spawn.sync(alternateOutput, [], {
  cwd: path.dirname(alternateOutput),
  env: { DEBUG_PKG: 42 },
  expect: 0,
});
assert(log2 === logRef);

utils.vacuum.sync(output);
