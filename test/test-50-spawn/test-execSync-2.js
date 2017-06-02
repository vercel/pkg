#!/usr/bin/env node

'use strict';

var execSync = require('child_process').execSync;

execSync(
  '"' + process.execPath + '" ' + [
    require.resolve('./test-execSync-child.js'), 'argvx', 'argvy'
  ].join(' '), { stdio: 'inherit' }
);
