#!/usr/bin/env node

/* eslint-disable no-bitwise */

"use strict";

var fs = require("fs");
var path = require("path");
var assert = require("assert");
var windows = process.platform === "win32";
var extension = windows ? ".exe" : "";

assert.equal(__dirname, process.cwd());

var DEBUG = false;
var buildType = DEBUG ? "Debug" : "Release";
var outPath = windows ? buildType : "out/" + buildType;

function main() {

  var pathFromHouse = path.join(
    "node", outPath, "node" + extension
  );

  if (!fs.existsSync(pathFromHouse)) {
    assert(false, "bad house output path: " + pathFromHouse);
  }

  var pathToHouse = path.join(
    "..", "bin", "house" + extension
  );

  var pathToHouseSize = path.join(
    path.dirname(pathToHouse), "house.size"
  );

  var fromHouse = fs.readFileSync(pathFromHouse);
  fs.writeFileSync(pathToHouseSize, fromHouse.length);
  console.log(pathToHouseSize + " <- " + fromHouse.length);
  fs.writeFileSync(pathToHouse, fromHouse);
  console.log(pathToHouse + " <- " + pathFromHouse);

  if (!windows) {
    var stat = fs.statSync(pathToHouse);
    var plusx = (stat.mode | 64 | 8).toString(8).slice(-3);
    fs.chmodSync(pathToHouse, plusx);
  }

}

module.exports = function(arg) {
  main(arg);
  console.log(__filename, "ok");
};

if (!module.parent) {
  module.exports();
}
