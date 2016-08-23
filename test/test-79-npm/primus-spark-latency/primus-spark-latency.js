'use strict';

let latency = require('primus-spark-latency');
if (latency.server) {
  console.log('ok');
}
