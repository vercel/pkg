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
var output = "./run-time/test-output.exe";

var right;
utils.mkdirp.sync(path.dirname(output));
utils.mkdirp.sync(path.join(path.dirname(output), "plugins-D-ext"));

fs.writeFileSync(
  path.join(path.dirname(output), "plugins-D-ext/test-y-require-D.js"),
                fs.readFileSync("./plugins-D-ext/test-y-require-D.js")
);

enclose.sync(flags.concat([
  "--output", output, input
]));

right = utils.spawn.sync(
  "./" + path.basename(output), [],
  { cwd: path.dirname(output) }
);

assert.equal(right,
  "I am C\n" +
  "I am D\n" +
  "test-x-index.js\n" +
  "test-y-common.js\n" +
  "plugins-C-int\n" +
  "plugins-D-ext\n"
);

utils.vacuum.sync(path.dirname(output));
