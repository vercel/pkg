'use strict';

var bunyan = require('bunyan');
var fs = require('fs');

var logger = bunyan.createLogger({
  name: 'pkg',
  streams: [
    {
      type: 'rotating-file',
      path: 'pkg.log',
      level: 'info',
    },
  ],
});

if (logger) {
  fs.unlinkSync('pkg.log');
  console.log('ok');
}
