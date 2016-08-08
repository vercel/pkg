#!/usr/bin/env node

"use strict";

// the generated executable does
// not need assets directory on disk,
// it may be deployed as standalone

var port = 1337;
var http = require("http");

var mime = {
  ".js": "text/javascript",
  ".html": "text/html",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif"
};

var fs = require("fs");
var path = require("path");

http.createServer(function(req, res) {

  var url = req.url.split("?")[0];
  url = url.replace(/\.\.\//g, "");
  if (url === "/") url = "index.html";
  var file = path.join(__dirname, "assets", url);
  var ext = path.extname(url);
  var ctype = mime[ext];
  ctype = ctype || "text/plain";

  var headersSent = false;
  var stream = fs.createReadStream(file);
  stream.on("error", function(error) {

    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(error.toString());

  }).on("data", function(data) {

    if (!headersSent) {
      headersSent = true;
      res.writeHead(200, { "Content-Type": ctype });
    }

    res.write(data);

  }).on("end", function() {

    res.end();

  });

}).listen(port, "127.0.0.1");

console.log("Port " + port.toString() + "...");
