'use strict';

var http = require('http');
var express = require('express');
var app = express();
app.set('views', 'views');
app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.render('fixture.jade', { title: 'Hey', message: 'Hello there!' });
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
          if (
            chunks ===
            '<html><head><title>Hey</title></head>' +
              '<body><h1>Hello there!</h1></body></html>'
          ) {
            console.log('ok');
          }
          server.close();
        });
    });
  }, 100);
});
