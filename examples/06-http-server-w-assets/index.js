#!/usr/bin/env node

// the generated executable does
// not need assets directory on disk,
// it may be deployed as standalone

let port = 1337;
let http = require('http');

let mime = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif'
};

let fs = require('fs');
let path = require('path');

http.createServer(function (req, res) {

  let url = req.url.split('?')[0];
  url = url.replace(/\.\.\//g, '');
  if (url === '/') url = 'index.html';
  let file = path.join(__dirname, 'assets', url);
  let ext = path.extname(url);
  let ctype = mime[ext];
  ctype = ctype || 'text/plain';

  let headersSent = false;
  let stream = fs.createReadStream(file);
  stream.on('error', function (error) {

    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(error.toString());

  }).on('data', function (data) {

    if (!headersSent) {
      headersSent = true;
      res.writeHead(200, { 'Content-Type': ctype });
    }

    res.write(data);

  }).on('end', function () {

    res.end();

  });

}).listen(port, '127.0.0.1');

console.log('Port ' + port.toString() + '...');
