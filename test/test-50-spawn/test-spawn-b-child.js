#!/usr/bin/env node

'use strict';

var assert = require('assert');
var cluster = require('cluster');

assert(process.send);
assert(!cluster.worker);

console.log('Hello from spawn-b-child!');
console.log('Args', JSON.stringify(process.argv.slice(2)));

process.on('message', function (value) {
  if (value === 128) process.exit();
  process.send(value * 2);
});

var fs = require('fs');

try {
  // must patch fs even if entrypoint is not in snapshot
  console.log(fs.readFileSync('dirty-hack-for-testing-purposes'));
} catch (error) {
  if (!process.pkg) console.log('dirty-hack-for-testing-purposes');
}
