#!/usr/bin/env node

"use strict";

var assert = require("assert");
assert.equal(__dirname, process.cwd());

function main() {
  var utils = require("../utils.js");
  utils.vacuum.sync("node");
}

module.exports = function() {
  main();
  console.log(__filename, "ok");
};

if (!module.parent) {
  console.log("DELETING NODE DISTRO...");
  setTimeout(function() {
    module.exports();
  }, 5000);
}
