#!/usr/bin/env node

"use strict";

var port = 1337;
var http = require("http");

http.createServer(function(req, res) {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello World\n");
}).listen(port, "127.0.0.1");

console.log("Port " + port.toString() + "...");
