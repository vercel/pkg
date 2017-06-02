#!/usr/bin/env node

'use strict';

var execFile = require('child_process').execFile;

var child = execFile(
  process.execPath, [
    require.resolve('./test-execFile-a-child.js'), 'argvx', 'argvy'
  ]
);

child.on('exit', function (code) {
  console.log(code);
  console.log('Child exited');
});
