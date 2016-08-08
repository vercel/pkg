#!/usr/bin/env node

"use strict";

var fs = require("fs");
var assert = require("assert");
var utils = require("../utils.js");

assert.equal(__dirname, process.cwd());

function main() {

  var info = require("./94-information.js");
  var version = info.version();
  var commitFile = info.commitFile();

  assert(version);

  var patchFiles = [];

  if (/^v?0.12./.test(version)) {
    patchFiles.push("backport.R00000.patch");
    patchFiles.push("backport.R24002.patch");
    patchFiles.push("backport.R24204.patch");
    patchFiles.push("backport.R24262.patch");
    patchFiles.push("backport.R24266.patch");
    patchFiles.push("backport.R24523.patch");
    patchFiles.push("backport.R24543.patch");
    patchFiles.push("backport.R24639.patch");
    patchFiles.push("backport.R24642.patch");
    patchFiles.push("backport.R24643.patch");
    patchFiles.push("backport.R24644.patch");
    patchFiles.push("backport.R24824.patch");
    patchFiles.push("backport.R25039.patch");
    patchFiles.push("backport.R25444.patch");
  }

  if (/^v?4./.test(version)) {
    patchFiles.push("backport.R32768.v8=4.5.patch");
  }

  if (/^v?5./.test(version)) {
    patchFiles.push("backport.R32768.v8=4.6.patch");
  }

  patchFiles.push("node." + version + ".patch");

  patchFiles.some(function(patchFile) {

    console.log("applying " + patchFile + "...");

    utils.spawn.sync(
      "patch", [ "-p0", "-i", patchFile ],
      { stdio: "inherit" }
    );

    console.log();

  });

  var commit = utils.spawn.sync(
    "git", [ "rev-parse", "--short", "HEAD" ],
    { cwd: ".." }
  );

  commit = commit.split("\n")[0];
  fs.writeFileSync(commitFile, commit);
  console.log("commit saved as " + commit);

  utils.spawn.sync(
    "git", [ "commit", "-a", "-m", "savepoint" ],
    { cwd: "node", stdio: "inherit" }
  );

}

module.exports = function() {
  main();
  console.log(__filename, "ok");
};

if (!module.parent) {
  module.exports();
}
