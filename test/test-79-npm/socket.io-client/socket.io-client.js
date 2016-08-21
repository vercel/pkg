let fs = require('fs');
let client = require('socket.io-client');
if (typeof client.protocol === 'number') {
  let literal = 'socket.io-client/socket.io.js';
  let p = require.resolve(literal, 'can-ignore');
  let asset = fs.readFileSync(p, 'utf8');
  if (asset.length > 100) {
    console.log('ok');
  }
}
