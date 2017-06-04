#!/usr/bin/env node

'use strict';

var pp = process.platform;
if (pp !== 'darwin' && pp !== 'linux') return;
var spawn = require('child_process').spawn;

var child = spawn(
  '/bin/bash', [
    '-c', 'node ' + require.resolve('./test-spawn-d-child.js') + ' argvx argvy'
  ], { stdio: 'inherit' }
);

child.on('exit', function (code) {
  console.log('Child exited with code', code);
});
