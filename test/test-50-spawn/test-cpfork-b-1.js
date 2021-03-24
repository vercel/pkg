#!/usr/bin/env node

'use strict';

var assert = require('assert');
var path = require('path');
var cp = require('child_process');
var child;

assert(!process.send);

try {
  child = cp.fork(path.join(process.cwd(), 'test-cpfork-b-child.js'));
} catch (e) {
  console.log(e.message);
}

child.on('message', function (value) {
  console.log(value.toString());
  child.send(value);
});

child.send(2);

child.on('exit', function (code) {
  console.log('Child exited with code', code);
});
