'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);

server.listen(8080);

// __dirname is used here along with package.json.pkg.assets
// see https://github.com/zeit/pkg#config and
// https://github.com/zeit/pkg#snapshot-filesystem
app.use('/lib', express.static(__dirname + '/views/lib'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
