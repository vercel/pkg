#!/usr/bin/env node

"use strict";

var fs = require("fs");
var path = require("path");
var assert = require("assert");
var globby = require("globby");
var utils = require("../utils.js");

assert.equal(__dirname, process.cwd());

var NODE_REPOSITORY_LOCAL = "../node_repository";
var NODE_REPOSITORY_ONLINE = "https://github.com/nodejs/node";

function main() {

  if (fs.existsSync("node")) {
    assert(false, "clean up first");
  }

  var dotGit = path.join(NODE_REPOSITORY_LOCAL, ".git");
  var dotGitStars = path.join(NODE_REPOSITORY_LOCAL, ".git/**/*");

  if (fs.existsSync(dotGit)) {

    console.log("Copying node...");

    globby.sync(dotGitStars).some(function(file) {

      if (!fs.statSync(file).isFile()) return;
      var r = path.relative(NODE_REPOSITORY_LOCAL, file);
      var n = path.join("node", r);
      utils.mkdirp.sync(path.dirname(n));
      fs.writeFileSync(n, fs.readFileSync(file));

    });

  } else {

    utils.spawn.sync(
      "git", [ "clone", NODE_REPOSITORY_ONLINE ],
      { stdio: "inherit" }
    );

  }

}

module.exports = function() {
  main();
  console.log(__filename, "ok");
};

if (!module.parent) {
  module.exports();
}
