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
utils.vacuum.sync("./serialport.win32-ia32.node.exe.node");
utils.vacuum.sync("./serialport.win32-ia32.node.exe.node");
utils.vacuum.sync("./serialport.win32-x64.node.exe.node");
utils.vacuum.sync("./serialport.win32-ia32.test-output.exe.node");
utils.vacuum.sync("./serialport.win32-x64.test-output.exe.node");
