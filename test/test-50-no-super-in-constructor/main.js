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

var version = a2o(flags).version;
if (/^v?0.12./.test(version)) return;
if (/^v?4./.test(version)) return;

var right;

enclose.sync(flags.concat([
  "--output", output, input
]));

right = utils.spawn.sync(
  "./" + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(right, "ok\n");
utils.vacuum.sync(output);
