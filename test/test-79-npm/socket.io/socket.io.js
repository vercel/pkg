'use strict';

let http = require('http');
let io = require('socket.io')();
io.on('connection', function () {});
io.listen(3000);

setTimeout(function () {
  http.get('http://127.0.0.1:3000/socket.io/socket.io.js', function (res) {
    let chunks = '';
    res.on('data', function (chunk) {
      chunks += chunk.toString();
    }).on('end', function () {
      if (chunks.indexOf('_dereq_') >= 0) {
        console.log('ok');
      }
      io.close();
    });
  });
}, 100);
