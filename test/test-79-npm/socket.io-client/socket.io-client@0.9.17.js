'use strict';

var fs = require('fs');
var client = require('socket.io-client');
if (typeof client.protocol === 'number') {
  var literal = 'socket.io-client/dist/socket.io.js';
  var path = require.resolve(literal, 'may-exclude');
  var asset = fs.readFileSync(path, 'utf8');
  var literalMin = 'socket.io-client/dist/socket.io.min.js';
  var pathMin = require.resolve(literalMin, 'may-exclude');
  var assetMin = fs.readFileSync(pathMin, 'utf8');
  if (asset.length > 100 && assetMin.length > 100) {
    console.log('ok');
  }
}
