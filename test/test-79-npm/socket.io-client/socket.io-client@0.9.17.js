let fs = require('fs');
let client = require('socket.io-client');
if (typeof client.protocol === 'number') {
  let literal = 'socket.io-client/dist/socket.io.js';
  let path = require.resolve(literal, 'can-ignore');
  let asset = fs.readFileSync(path, 'utf8');
  let literalMin = 'socket.io-client/dist/socket.io.min.js';
  let pathMin = require.resolve(literalMin, 'can-ignore');
  let assetMin = fs.readFileSync(pathMin, 'utf8');
  if ((asset.length > 100) &&
      (assetMin.length > 100)) {
    console.log('ok');
  }
}
