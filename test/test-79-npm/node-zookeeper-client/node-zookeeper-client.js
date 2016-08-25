'use strict';

var zookeeper = require('node-zookeeper-client');
var client = zookeeper.createClient('localhost:2181');
if (client.state) {
  console.log('ok');
}
