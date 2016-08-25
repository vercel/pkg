'use strict';

var latency = require('primus-spark-latency');
if (latency.server) {
  console.log('ok');
}
