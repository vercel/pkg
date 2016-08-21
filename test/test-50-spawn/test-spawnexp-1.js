#!/usr/bin/env node

let spawn = require('child_process').spawn;
let child;

if (process.send) {
  require('./test-spawnexp-child.js');
  return;
}

child = spawn(
  process.execPath, [ process.argv[1] ],
  { stdio: [ 'inherit', 'inherit', 'inherit', 'ipc' ] }
);

child.on('message', function (value) {
  console.log(value.toString());
  child.send(value);
});

child.send(2);

child.on('exit', function () {
  console.log('Spawn child exited');
});
