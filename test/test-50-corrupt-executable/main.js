#!/usr/bin/env node

"use strict";

return; // TODO
/* eslint-disable no-unreachable */

var fs = require("fs");
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

var right;

enclose.sync(flags.concat([
  "--output", output, input
]));

var spoiler = fs.readFileSync(output);
spoiler[spoiler.length - 100] += 1;
spoiler[spoiler.length - 120] -= 1;
fs.writeFileSync(output, spoiler);

right = utils.spawn.sync(
  "./" + path.basename(output), [],
  { cwd: path.dirname(output),
    stdio: "super-pipe", expect: 2 }
);

assert.equal(right.stdout, "");
assert.equal(right.stderr, "Corrupt executable\n");
utils.vacuum.sync(output);
