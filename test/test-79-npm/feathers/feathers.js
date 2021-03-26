'use strict';

var feathers = require('feathers');
var http = require('http');
var app = feathers();

app.get('/', function (req, res) {
  res.end('Hello there!');
});

var server = app.listen(1337, function () {
  var port = server.address().port;
  setTimeout(function () {
    http.get('http://127.0.0.1:' + port.toString() + '/', function (res) {
      var chunks = '';
      res
        .on('data', function (chunk) {
          chunks += chunk.toString();
        })
        .on('end', function () {
          if (chunks === 'Hello there!') {
            console.log('ok');
          }
          server.close();
        });
    });
  }, 100);
});
