#!/usr/bin/env node

'use strict';

var spawn = require('child_process').spawn;

if (process.send) {
  require('./test-spawn-a-child.js');
  return;
}

var child = spawn(process.execPath, [process.argv[1], 'argvx', '--argvy'], {
  stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
});

child.on('message', function (value) {
  console.log(value.toString());
  child.send(value);
});

child.send(2);

child.on('exit', function (code) {
  console.log('Child exited with code', code);
});
