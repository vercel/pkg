'use strict';

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
  name: 'pkg',
  streams: [{
    type: 'rotating-file',
    path: 'pkg.log',
    level: 'info'
  }]
});

if (logger) {
  console.log('ok');
}
