'use strict';

var NRP = require('node-redis-pubsub');
var config = { port: 6379, scope: 'demo' };
new NRP(config); // eslint-disable-line no-new

process.on('uncaughtException', function (error) {
  var ok = error.code === 'ECONNREFUSED';
  if (ok) console.log('ok');
  process.exit();
});
