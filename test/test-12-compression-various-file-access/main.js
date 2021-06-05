#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

/* eslint-disable no-unused-vars */
const target = process.argv[2] || 'host';
const ext = process.platform === 'win32' ? '.exe' : '';
const output = 'output' + ext;

async function runTest(input) {
  const output_none = output + '_' + path.parse(input).name;
  const output_gzip = 'gzip_' + output_none;

  const logPkgNone = utils.pkg.sync(
    ['--target', target, '--compress', 'None', '--output', output_none, input],
    { expect: 0 }
  );
  const logPkgGZip = utils.pkg.sync(
    ['--target', target, '--compress', 'GZIP', '--output', output_gzip, input],
    { expect: 0 }
  );

  // -----------------------------------------------------------------------
  // Execute program outside pjg
  const logRef = utils.spawn.sync('node', [path.join(__dirname, input)], {
    cwd: __dirname,
    expect: 0,
  });

  const logNone = utils.spawn.sync(path.join(__dirname, output_none), [], {
    cwd: __dirname,
    expect: 0,
  });

  const logGZip = utils.spawn.sync(path.join(__dirname, output_gzip), [], {
    cwd: __dirname,
    expect: 0,
  });

  if (logRef !== logNone) {
    console.log(
      " uncompress pkg doesn't produce same result as running with node"
    );
  }
  if (logRef !== logGZip) {
    console.log(
      " GZIP compress pkg doesn't produce same result as running with node"
    );
  }

  if (logRef !== logNone || logRef !== logGZip) {
    console.log(' Reference:');
    console.log(logRef);
    console.log(' Uncompress:');
    console.log(logNone);
    console.log(' GZIPed:');
    console.log(logGZip);

    console.log('------------ ERROR');
    process.exit(1000);
  }
  utils.vacuum.sync(output);
  utils.vacuum.sync('gzip_' + output);
}

const input1 = 'test.js';

console.log('  now testing with fs callback');
runTest(input1);

console.log('  now testing with fs.promises');
const input2 = 'test_with_new_fs_promises.js';
runTest(input2);

console.log('Done');
process.exit(0);
