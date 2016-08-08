#!/usr/bin/env node

"use strict";

var fs = require("fs");
var assert = require("assert");
var utils = require("../utils.js");

assert.equal(__dirname, process.cwd());

function main(arg) {

  var info = require("./94-information.js");
  var versionFile = info.versionFile();
  var version;

  if (!version) {
    version = arg;
    if (version) {
      fs.writeFileSync(versionFile, version);
    }
  }

  if (!version) {
    version = info.version();
    if (version) {
      console.log("no version entered. assuming recent " + version);
    }
  }

  assert(version, "enter version as an option");

  assert(fs.existsSync(
    "node." + version + ".patch" // check in advance
  ), "patch not found for version " + version);

  utils.spawn.sync(
    "git", [ "reset", "--hard", version ],
    { cwd: "node", stdio: "inherit" }
  );

  fs.writeFileSync(versionFile, version);

}

module.exports = function(arg) {
  main(arg);
  console.log(__filename, "ok");
};

if (!module.parent) {
  module.exports(process.argv[2]);
}
