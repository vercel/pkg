/* eslint-disable no-underscore-dangle */

"use strict";

process.argv.push("--help");
require("homebridge/lib/cli.js"); // dont run. only load
var Server = require("homebridge/lib/server.js").Server;
var server = new Server();
if (server._api) {
  console.log("ok");
}
