'use strict';

var express = require('express');
var app = express();
var Server = require('http').Server;
var server = new Server(app);
var open = require('open');

var port = 8080;
server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
  console.log(`Try to open firefox => http://localhost:${port}`);
  open(`localhost:${port}`, { app: 'firefox' });
});

// __dirname is used here along with package.json.pkg.assets
// see https://github.com/zeit/pkg#config and
// https://github.com/zeit/pkg#snapshot-filesystem
app.use('/', express.static(__dirname + '/views'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
