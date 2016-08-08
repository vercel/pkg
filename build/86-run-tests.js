#!/usr/bin/env node

"use strict";

var assert = require("assert");
assert.equal(__dirname, process.cwd());

function main(arch, version) {
  var tests = require("../test.js");
  tests([ "--arch", arch,
          "--version", version,
          "--loglevel", "error" ]);
}

module.exports = function(arch, version) {
  main(arch, version);
  console.log(__filename, "ok");
};

if (!module.parent) {
  var info = require("./94-information.js");
  module.exports(info.arch(), info.version());
}
