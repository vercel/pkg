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

const doDebug = false;

const ext = process.platform === 'win32' ? '.exe' : '';
const output = './output' + ext;
const input = './package.json';

// remove any possible left-over
// utils.vacuum.sync('./node_modules');

const version = utils.exec.sync('node --version');
if (doDebug) {
  console.log('node version = ', version);
}

// launch `yarn`
const yarnlog = utils.exec.sync('yarn');
if (doDebug) {
  console.log('yarn log :', yarnlog);
}

// -----------------------------------------------------------------------
// Execute programm outside pjg
const logRef = utils.spawn.sync(
  'node',
  [path.join(__dirname, 'src/index.js')],
  {
    cwd: __dirname,
    expect: 0,
    stdio: ['inherit', 'pipe', 'pipe'],
  }
);

function runTest(doCompress) {
  const options = [
    '--target',
    target,
    '--output',
    output,
    input,
    ...doCompress,
  ];

  utils.pkg.sync(options, {
    expect: 0,
  });

  const log = utils.spawn.sync(path.join(__dirname, output), [], {
    cwd: __dirname,
    expect: 0,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  if (doDebug) {
    console.log(logRef.stdout);
  }

  if (logRef.stdout !== log.stdout) {
    console.log('expecting', logRef.stdout);
    console.log('but got =', log.stdout);
    process.exit(1);
  }
  if (logRef.stderr !== log.stderr) {
    console.log('expecting', logRef.stderr);
    console.log('but got =', log.stderr);
    process.exit(1);
  }
}

runTest([]);
runTest(['--compress', 'GZip']);
runTest(['--compress', 'Brotli']);

utils.vacuum.sync(output);
// utils.vacuum.sync('node_modules');
utils.vacuum.sync('package-lock.json');
console.log('Done');
