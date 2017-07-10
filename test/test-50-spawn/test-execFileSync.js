#!/usr/bin/env node

'use strict';

var execFileSync = require('child_process').execFileSync;

execFileSync(
  process.execPath, [
    require.resolve('./test-execFileSync-child.js'), 'argvx', 'argvy'
  ], { stdio: 'inherit' }
);
