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

var right;

enclose.sync(flags.concat([
  "--output", output, input
]));

right = utils.spawn.sync(
  "./" + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(right,
  "true\n" +
  "false\n" +
  "Cannot write to packaged file\n" +
  "true\n" +
  "closed\n" +
  "false\n" +
  "Cannot write to packaged file\n" +
  "Cannot write to packaged file\n" +
  "undefined\n" +
  "Cannot write to packaged file\n" +
  "undefined\n"
);

utils.vacuum.sync(output);
