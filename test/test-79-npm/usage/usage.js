"use strict";

var usage = require("usage");
var pid = process.pid;
usage.lookup(pid, function(error, result) {
  if (result.memory) {
    console.log("ok");
  }
});
