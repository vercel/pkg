#!/usr/bin/env node

"use strict";

var fs = require("fs");
var path = require("path");
var assert = require("assert");
var utils = require("../../utils.js");
var enclose = require("../../").exec;

assert(!module.parent);
assert(__dirname === process.cwd());

var flags = process.argv.slice(2);
var input = "./test-x-index.js";
var output = "./test-output.exe";
var data = "./test-y-data.txt";

var left, right;

left = fs.readFileSync(
  data, "utf8"
).split("\n").filter(function(line) {
  return line.indexOf("/***/ ") >= 0;
}).map(function(line) {
  return line.split("/***/ ")[1];
}).join("\n") + "\n";

enclose.sync(flags.concat([
  "--output", output, input
]));

right = utils.spawn.sync(
  "./" + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(left, right);
utils.vacuum.sync(output);
