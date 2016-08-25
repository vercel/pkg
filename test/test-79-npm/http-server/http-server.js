'use strict';

var http = require('http');
process.argv.push('--silent');
require('http-server/bin/http-server');
setTimeout(function () {
  http.get('http://127.0.0.1:8080/package.json', function (res) {
    if (res.statusCode) {
      console.log('ok');
      process.exit();
    }
  });
}, 5000);
