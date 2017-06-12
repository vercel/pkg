#!/usr/bin/env node

'use strict';

// AppVeyor: unquoted execPath inside 'Program Files'
if (process.platform === 'win32') return;
var execSync = require('child_process').execSync;

execSync(
  process.execPath + ' ' + [
    require.resolve('./test-execSync-child.js'), 'argvx', 'argvy'
  ].join(' '), { stdio: 'inherit' }
);
