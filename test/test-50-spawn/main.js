#!/usr/bin/env node

/* eslint-disable no-bitwise */

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

var pairs = [
  { input: "./test-cluster.js",
    output: "./run-time/test-output.exe" },
  { input: "./test-cpfork-1.js",
    output: "./run-time/test-output.exe" },
  { input: "./test-cpfork-2.js",
    output: "./run-time/test-output.exe" },
  { input: "./test-cpforkext-1.js",
    output: "./test-output.exe" },
  { input: "./test-cpforkext-2.js",
    output: "./test-output.exe" },
  { input: "./test-spawnexp-1.js",
    output: "./run-time/test-output.exe" },
  { input: "./test-spawnexp-2.js",
    output: "./run-time/test-output.exe" }
];

if (!windows) {
  pairs.push(
    { input: "./test-spawn-1.js",
      output: "./run-time/test-output.exe" },
    { input: "./test-spawn-2.js",
      output: "./run-time/test-output.exe" }
  );
}

function chmodPlusX(file) {
  var stat = fs.statSync(file);
  var plusx = (stat.mode | 64 | 8).toString(8).slice(-3);
  fs.chmodSync(file, plusx);
}

chmodPlusX("./test-spawn-1.js");
chmodPlusX("./test-spawn-2.js");

function stripTraceOpt(lines) {
  return lines.split("\n").filter(function(line) {
    return (line.indexOf("[disabled optimization") < 0) &&
           (line.indexOf("[marking") < 0) &&
           (line.indexOf("[compiling method") < 0) &&
           (line.indexOf("[optimizing") < 0) &&
           (line.indexOf("[completed optimizing") < 0) &&
           (line.indexOf("einfo:") < 0);
  }).join("\n");
}

pairs.some(function(pair) {

  var input = pair.input;
  var output = pair.output;

  var left, right;
  utils.mkdirp.sync(path.dirname(output));

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

  right = stripTraceOpt(right);
  left = stripTraceOpt(left);
  assert.equal(left, right);
  utils.vacuum.sync("run-time");
  utils.vacuum.sync(output);

});
