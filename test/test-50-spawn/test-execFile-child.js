#!/usr/bin/env node

'use strict';

var assert = require('assert');
var cluster = require('cluster');

assert(!process.send);
assert(!cluster.worker);

console.log('Hello from execFile-child!');
process.exit(4 + process.argv.length);
