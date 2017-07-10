#!/usr/bin/env node

'use strict';

var assert = require('assert');
var cluster = require('cluster');
var child;

if (process.send) {
  require('./test-cluster-child.js');
  return;
}

assert(cluster.isMaster);

try {
  child = cluster.fork();
} catch (e) {
  console.log(e.message);
}

child.on('message', function (value) {
  console.log(value.toString());
  child.send(value);
});

child.send(2);

cluster.on('exit', function (_, code) {
  console.log('Child exited with code', code);
});
