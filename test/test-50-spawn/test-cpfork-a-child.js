#!/usr/bin/env node

'use strict';

var assert = require('assert');
var cluster = require('cluster');

assert(process.send);
assert(!cluster.worker);

console.log('Hello from cpfork-a-child!');
console.log('Args', JSON.stringify(process.argv.slice(2)));

process.on('message', function (value) {
  if (value === 128) process.exit();
  process.send(value * 2);
});
