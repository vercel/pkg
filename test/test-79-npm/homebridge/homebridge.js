/* eslint-disable no-underscore-dangle */

'use strict';

process.argv.push('--help');
require('homebridge/lib/cli.js'); // dont run. only load
let Server = require('homebridge/lib/server.js').Server;
let server = new Server();
if (server._api) {
  console.log('ok');
}
