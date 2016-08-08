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
var windows = process.platform === "win32";
var a2o = require("../../").argsToObject;
var input = "./test-x-index.js";
var output = "./run-time/test-output.exe";

if (!windows) return;
var arch = a2o(flags).arch;
if (arch !== "x64") return;
var version1 = process.version;
if (!(/^v?4./.test(version1))) return;
var version2 = a2o(flags).version;
if (!(/^v?4./.test(version2))) return;

var left, right;
utils.mkdirp.sync(path.dirname(output));

fs.writeFileSync(
  path.join(path.dirname(output), "time.node"),
  fs.readFileSync("./time.node")
);

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
utils.vacuum.sync(path.dirname(output));
