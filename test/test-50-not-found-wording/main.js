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
var output = "./run-time/test-output.exe";

var right;
utils.mkdirp.sync(path.dirname(output));

enclose.sync(flags.concat([
  "--output", output, input
]));

right = utils.spawn.sync(
  "./" + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert(
  right.split("*****")[0].indexOf("was not included into executable at compilation stage") >= 0
);

assert(
  right.split("*****")[1].indexOf("you want to enclose the package") >= 0
);

utils.vacuum.sync(path.dirname(output));
