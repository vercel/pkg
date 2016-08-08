#!/usr/bin/env node

"use strict";

var fs = require("fs");
var assert = require("assert");
var utils = require("../../utils.js");
var enclose = require("../../").exec;

assert(!module.parent);
assert(__dirname === process.cwd());

var flags = process.argv.slice(2);
var a2o = require("../../").argsToObject;
var o2a = require("../../").objectToArgs;
var input = "./test-x-index.js";
var output = "./test-output.exe";
var standard = "stdout";

var argo = a2o(flags);
argo.loglevel = "info";
flags = o2a(argo);

var left, right;

left = fs.readFileSync(
  input, "utf8"
).split("\n").filter(function(line) {
  return line.indexOf("/**/") >= 0;
}).map(function(line) {
  return line.split("/**/")[1];
}).join("\n") + "\n";

var inspect = (standard === "stdout")
  ? [ "inherit", "pipe", "inherit" ]
  : [ "inherit", "inherit", "pipe" ];

var c = enclose.sync(flags.concat([
  "--output", output, input
]), inspect);

right = c[standard].toString();
assert(right.indexOf("\x1B\x5B") < 0, "colors detected");

var rightLines = [];
right.split("\n").some(function(line) {
  var s = line.split("Cannot resolve '")[1];
  if (s) {
    rightLines.push(s.split("'")[0]);
    return;
  }
  s = line.split("Path.resolve(")[1];
  if (s) {
    rightLines.push(s.split(")")[0]);
    return;
  }
});

right = rightLines.join("\n") + "\n";
assert.equal(left, right);
utils.vacuum.sync(output);
