#!/usr/bin/env node

let assert = require('assert');
let cluster = require('cluster');
let child;

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

cluster.on('exit', function () {
  console.log('Cluster worker exited');
});
