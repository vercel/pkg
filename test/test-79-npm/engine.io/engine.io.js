'use strict';

var http = require('http');
var engine = require('engine.io');
engine.listen(3000);

setTimeout(function () {
  http.get('http://127.0.0.1:3000/socket.io/socket.io.js', function (res) {
    var chunks = '';
    res
      .on('data', function (chunk) {
        chunks += chunk.toString();
      })
      .on('end', function () {
        if (chunks === 'Not Implemented') {
          console.log('ok');
        }
        process.exit();
      });
  });
}, 100);
