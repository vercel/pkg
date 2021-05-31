'use strict';

process.argv.push('--help');
require('homebridge/lib/cli.js'); // dont run. only load
var Server = require('homebridge/lib/server.js').Server;
var server = new Server();

// eslint-disable-next-line no-underscore-dangle
if (server._api) {
  console.log('ok');
}
