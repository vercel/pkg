'use strict';

var redis = require('redis');
var client = redis.createClient();

client.on('error', function (error) {
  var ok = error.message.indexOf('ECONNREFUSED') >= 0;
  if (ok) console.log('ok');
  process.exit();
});
