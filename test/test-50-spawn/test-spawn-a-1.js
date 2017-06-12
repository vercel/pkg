#!/usr/bin/env node

'use strict';

var spawn = require('child_process').spawn;

if (process.send) {
  require('./test-spawn-a-child.js');
  return;
}

var child = spawn(
  process.execPath, [ __filename, 'argvx', 'argvy' ],
  { stdio: [ 'inherit', 'inherit', 'inherit', 'ipc' ] }
);

function ifError (error) {
  if (error) {
    console.log('child.send.error', error);
  }
}

child.on('message', function (value) {
  console.log(value.toString());
  if ((process.version.slice(1, 3) | 0) > 0) {
    child.send(value, ifError);
  } else {
    child.send(value);
  }
});

child.send(2);

child.on('exit', function (code) {
  console.log('Child exited with code', code);
});
