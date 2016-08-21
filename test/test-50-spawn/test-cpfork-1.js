#!/usr/bin/env node

let assert = require('assert');
let cp = require('child_process');
let child;

assert(!process.send);

try {
  child = cp.fork(
    require.resolve('./test-cpfork-child.js')
  );
} catch (e) {
  console.log(e.message);
}

child.on('message', function (value) {
  console.log(value.toString());
  child.send(value);
});

child.send(2);

child.on('exit', function () {
  console.log('Forked child exited');
});
