#!/usr/bin/env node

"use strict";

var path = require("path");
var assert = require("assert");
var utils = require("../../utils.js");
var enclose = require("../../").exec;
var a2o = require("../../").argsToObject;

assert(!module.parent);
assert(__dirname === process.cwd());

var flags = process.argv.slice(2);
var input = "./test-x-index.js";
var output = "./test-output.exe";

var arch = process.arch;
if (arch === "arm") return;
var version1 = process.version;
if (/^v?0.12./.test(version1)) return;
var version2 = a2o(flags).version;
if (/^v?0.12./.test(version2)) return;

var left, right;

left = utils.spawn.sync(
  "node", [ path.basename(input) ],
  { cwd: path.dirname(input) }
);

enclose.sync(flags.concat([
  "--output", output, input
]));

right = utils.spawn.sync(
  "./" + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(left, right);
utils.vacuum.sync(output);
