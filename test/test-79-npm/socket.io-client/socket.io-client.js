'use strict';

var fs = require('fs');
var client = require('socket.io-client');
if (typeof client.protocol === 'number') {
  var literal = 'socket.io-client/dist/socket.io.js';
  var p = require.resolve(literal, 'may-exclude');
  var asset = fs.readFileSync(p, 'utf8');
  if (asset.length > 100) {
    console.log('ok');
  }
}
