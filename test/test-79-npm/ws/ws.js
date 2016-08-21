let WebSocket = require('ws');
let ws = new WebSocket('ws://127.0.0.1/');
ws.on('error', function () {
  console.log('ok');
});
