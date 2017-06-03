#!/usr/bin/env node

'use strict';

var assert = require('assert');
var cluster = require('cluster');

assert(!process.send);
assert(!cluster.worker);

console.log('Hello from exec-child!');

var major = process.version.match(/^v(\d+)/)[1] | 0;
// probably because of --debug-port
if (major === 0) {
  process.exit(4 + process.argv.length - 1);
} else {
  process.exit(4 + process.argv.length);
}
