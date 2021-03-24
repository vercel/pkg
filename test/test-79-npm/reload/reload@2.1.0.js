'use strict';

var http = require('http');
require('reload/bin/reload');

setTimeout(function () {
  http.get('http://127.0.0.1:8080/', function (res) {
    var chunks = '';
    res
      .on('data', function (chunk) {
        chunks += chunk.toString();
      })
      .on('end', function () {
        if (chunks === "Can't find index.html" || chunks === 'File Not Found') {
          console.log('ok');
        }
        process.exit();
      });
  });
}, 500);
