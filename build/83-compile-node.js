#!/usr/bin/env node

"use strict";

var fs = require("fs");
var assert = require("assert");
var utils = require("../utils.js");

assert.equal(__dirname, process.cwd());

var DEBUG = false;

function main(arg) {

  var info = require("./94-information.js");
  var windows = process.platform === "win32";
  var archFile = info.archFile();
  var arch;

  if (!arch) {
    arch = arg;
    if (arch) {
      fs.writeFileSync(archFile, arch);
    }
  }

  if (!arch) {
    arch = info.arch();
    if (arch) {
      console.log("no arch entered. assuming recent " + arch);
    }
  }

  assert(arch, "enter arch as an option");
  var archs = { x86: 1, ia32: 1, x64: 1, armv6: 1, armv7: 1 };
  assert(archs[arch], "unknown arch " + arch);
  fs.writeFileSync(archFile, arch);
  var args = [];

  if (windows) {

    args.push("/c", "vcbuild.bat", arch, "nosign");
    if (DEBUG) args.push("debug");

    utils.spawn.sync(
      "cmd", args,
      { cwd: "node", stdio: "inherit" }
    );

  } else {

    args.push("--dest-cpu", {
      x86: "ia32", ia32: "ia32", x64: "x64",
      armv6: "arm", armv7: "arm"
    }[arch]);

    if (DEBUG) args.push("--debug");

    utils.spawn.sync(
      "./configure", args,
      { cwd: "node", stdio: "inherit" }
    );

    utils.spawn.sync(
      "make", [],
      { cwd: "node", stdio: "inherit" }
    );

  }

}

module.exports = function(arg) {
  main(arg);
  console.log(__filename, "ok");
};

if (!module.parent) {
  console.log("COMPILING NODE...");
  setTimeout(function() {
    module.exports(process.argv[2]);
  }, 5000);
}
