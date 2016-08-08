#!/usr/bin/env node

"use strict";

var fs = require("fs");
var path = require("path");
var assert = require("assert");

function getVersionFile() {
  return path.join("node", ".version");
}

function getVersion() {
  if (!fs.existsSync(getVersionFile())) return null;
  return fs.readFileSync(getVersionFile(), "utf8");
}

function getArchFile() {
  return path.join("node", ".arch");
}

function getArch() {
  if (!fs.existsSync(getArchFile())) return null;
  return fs.readFileSync(getArchFile(), "utf8");
}

function getCommitFile() {
  return path.join("node", ".commit");
}

function getCommit() {
  if (!fs.existsSync(getCommitFile())) return null;
  return fs.readFileSync(getCommitFile(), "utf8");
}

function getSuffix() {

  var suffix = {
    "win32": {
      "x86": "win32",
      "x64": "win64"
    },
    "linux": {
      "x86": "linux-x86",
      "x64": "linux-x64",
      "armv6": "linux-armv6",
      "armv7": "linux-armv7"
    },
    "darwin": {
      "x86": "darwin-x86",
      "x64": "darwin-x64"
    }
  }[process.platform][getArch()];

  assert(suffix, "arch file not found");
  return suffix;

}

if (module.parent) {
  module.exports = {
    versionFile: getVersionFile,
    version: getVersion,
    archFile: getArchFile,
    arch: getArch,
    commitFile: getCommitFile,
    commit: getCommit,
    suffix: getSuffix
  };
} else {
  console.log("version:", getVersion());
  console.log("arch:", getArch());
  console.log("commit:", getCommit());
  console.log("suffix:", getSuffix());
}
