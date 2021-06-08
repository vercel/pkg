#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

/* eslint-disable no-unused-vars */
const target = process.argv[2] || 'host';

if (target !== 'host') {
  console.log('skipping test, as target=', target);
  // skipping test, this test would require recompiling for a different node version
  return;
}

const ext = process.platform === 'win32' ? '.exe' : '';
const output1 = './output1' + ext;
const output2 = './output2' + ext;
const input = './index.js';

// remove any possible left-over
utils.vacuum.sync('./node_modules');

const version = utils.exec.sync('node --version');
console.log('node version = ', version);

// launch `yarn`
const yarnlog = utils.exec.sync('yarn');
console.log('yarn log :', yarnlog);

// -----------------------------------------------------------------------
// Execute programm outside pjg
const logRef = utils.spawn.sync('node', [path.join(__dirname, input)], {
  cwd: __dirname,
  expect: 0,
});

if (logRef.replace(/\r|\n/g, '') !== '42') {
  console.log(`expecting 42 but got ${logRef}`);
  process.exit(1);
}

function doTestWithCompression() {
  console.log('doTestWithCompression');
  utils.pkg.sync(
    ['--compress', 'Brotli', '--target', target, '--output', output1, input],
    {
      //   expect: 0,
    }
  );
  const log = utils.spawn.sync(path.join(__dirname, output1), [], {
    cwd: __dirname,
    // expect: 0,
    stdio: ['inherit', 'pipe', 'pipe'],
  });
  return log;
}
function doTestNoCompression() {
  console.log('doTestNoCompression');
  utils.pkg.sync(['--target', target, '--output', output2, input], {
    //  expect: 0,
  });
  const log = utils.spawn.sync(path.join(__dirname, output2), [], {
    cwd: __dirname,
    expect: 0,
    stdio: ['inherit', 'pipe', 'pipe'],
  });
  return log;
}
const logNoCompression = doTestNoCompression();
if (logNoCompression.stderr !== '') {
  console.log('NO COMPRESSION: expecting no error');
  console.log('but got =', logNoCompression.stderr);
  process.exit(1);
}

const logWithCompression = doTestWithCompression();
if (logWithCompression.stderr !== '') {
  console.log('NO COMPRESSION: expecting no error');
  console.log('but got =', logWithCompression.stderr);
  process.exit(1);
}

// now with compress

utils.vacuum.sync(output1);
utils.vacuum.sync(output2);
utils.vacuum.sync('node_modules');
utils.vacuum.sync('package-lock.json');
utils.vacuum.sync('test.sqlite');
console.log('Done');
