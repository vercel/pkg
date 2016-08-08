#!/usr/bin/env node

"use strict";

var fs = require("fs");
var assert = require("assert");
assert.equal(__dirname, process.cwd());

var platform = process.platform;
var arch = require("../bin/enclose.js").arch();

function generateTasks(arg) {

  var branchesMap = {
    14: "v0.12.15",
    46: "v4.4.7",
    48: "v6.3.1"
  };

  Object.keys(branchesMap).some(function(key) {
    var branch = branchesMap[key];
    assert(fs.existsSync(
      "node." + branch + ".patch" // check in advance
    ), "update versions");
  });

  if (arg === "all") {

    var branches = [], archs = [];

    if (platform === "linux") {
      if (arch === "armv6" ||
          arch === "armv7") {
        branches.push(46, 48);
        archs.push(arch);
      } else {
        branches.push(14, 46, 48);
        archs.push("x86", "x64");
      }
    } else
    if (platform === "win32") {
      branches.push(14, 46, 48);
      archs.push("x86", "x64");
    } else
    if (platform === "darwin") {
      branches.push(14, 46, 48);
      archs.push("x64");
    } else {
      assert(false);
    }

    var tasks = [];
    branches.some(function(b) {
      archs.some(function(a) {
        tasks.push([ branchesMap[b], a ]);
      });
    });

    return tasks;

  } else {

    var b = process.versions.modules;
    var branch = branchesMap[b];
    assert(branch, "Branch M" + b + " not supported");
    return [ [ branch, arch ] ];

  }

}

function main(arg, cb) {

  console.log("host platform: " + platform);
  console.log("host arch: " + arch);

  require("./87-cleanup.js")();

  var tasks = generateTasks(arg);

  function loop() {

    var task = tasks.shift();
    if (!task) return cb();

    require("./80-git-clone-node.js")();
    require("./81-git-hard-reset.js")(task[0]);
    require("./82-apply-patch.js")();
    require("./83-compile-node.js")(task[1]);
    require("./84-copy-binaries.js")();
    require("./85-compile-enclose.js")(function() {
      if (arg === "all") {
        require("./86-run-tests.js")(task[1], task[0]);
        require("./87-cleanup.js")();
      }
      loop();
    });

  }

  loop();

}

module.exports = function(arg, cb) {
  main(arg, function() {
    console.log(__filename, "ok");
    if (cb) return cb();
  });
};

if (!module.parent) {
  module.exports(process.argv[2]);
}
