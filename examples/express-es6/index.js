'use strict';

import express from 'express';
import { Server } from 'http';

let app = express();
var server = new Server(app);

server.listen(4200);

// __dirname is used here along with package.json.pkg.assets
// see https://github.com/zeit/pkg#config and
// https://github.com/zeit/pkg#snapshot-filesystem
app.use('/', express.static(__dirname + '/views'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
