#!/usr/bin/env node

'use strict';

if (process.platform !== 'win32') return;
var spawn = require('child_process').spawn;

var child = spawn(
  'cmd.exe', [
    '/s', '/c', '"node ' + require.resolve('./test-spawn-c-child.js') + ' argvx argvy"'
  ], { stdio: 'inherit', windowsVerbatimArguments: true }
);

child.on('exit', function (code) {
  console.log('Child exited with code', code);
});
