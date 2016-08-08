#!/usr/bin/env node

"use strict";

var path = require("path");
var assert = require("assert");
var utils = require("../../utils.js");
var enclose = require("../../").exec;

assert(!module.parent);
assert(__dirname === process.cwd());

var flags = process.argv.slice(2);
var input = "./src/app.js";
var output = "./run-time/app-output.exe";

var left, right;
utils.mkdirp.sync(path.dirname(output));

left = utils.spawn.sync(
  "node", [ path.basename(input) ],
  { cwd: path.dirname(input) }
);

enclose.sync(flags.concat([
  "--config", "./config.js",
  "--output", output, input
]));

right = utils.spawn.sync(
  "./" + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(left, right);
utils.vacuum.sync(path.dirname(output));
