#!/usr/bin/env node

'use strict';

var spawn = require('child_process').spawn;

var child = spawn(
  process.execPath, [
    require.resolve('./test-spawn-a-child.js'), 'argvx', 'argvy'
  ], { stdio: [ 'inherit', 'inherit', 'inherit', 'ipc' ] }
);

child.on('message', function (value) {
  console.log(value.toString());
  child.send(value);
});

child.send(2);

child.on('exit', function (code) {
  console.log('Child exited with code', code);
});
