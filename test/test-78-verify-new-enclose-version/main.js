#!/usr/bin/env node

"use strict";

var path = require("path");
var assert = require("assert");
var utils = require("../../utils.js");
var enclose = require("../../").exec;

assert(!module.parent);
assert(__dirname === process.cwd());

var flags = process.argv.slice(2);
var input = "./test-x-index.js";
var output = "./test-output.exe";

var left, right;

var versions = utils.exec.sync(
  "npm view enclose versions"
).replace(/'/g, "\"");

versions = JSON.parse(versions);
left = versions[versions.length - 1];
left = left.split(".").map(function(entity) {
  return parseInt(entity, 10);
});

enclose.sync(flags.concat([
  "--output", output, input
]));

right = utils.spawn.sync(
  "./" + path.basename(output), [],
  { cwd: path.dirname(output) }
);

right = right.split(".").map(function(entity) {
  return parseInt(entity, 10);
});

left = left[0] * 10000 + left[1] * 100 + left[2];
right = right[0] * 10000 + right[1] * 100 + right[2];

assert(left < right, left.toString() + " < " + right.toString());
utils.vacuum.sync(output);
