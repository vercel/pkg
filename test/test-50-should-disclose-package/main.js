#!/usr/bin/env node

"use strict";

var path = require("path");
var assert = require("assert");
var utils = require("../../utils.js");
var enclose = require("../../").exec;

assert(!module.parent);
assert(__dirname === process.cwd());

var flags = process.argv.slice(2);
var a2o = require("../../").argsToObject;
var o2a = require("../../").objectToArgs;
var input = "./test-x-index.js";
var output = "./test-output.exe";
var standard = "stdout";

var argo = a2o(flags);
argo.loglevel = "info";
flags = o2a(argo);

var right;

var inspect = (standard === "stdout")
  ? [ "inherit", "pipe", "inherit" ]
  : [ "inherit", "inherit", "pipe" ];

var c = enclose.sync(flags.concat([
  "--output", output, input
]), inspect);

right = c[standard].toString();
assert(right.indexOf("\x1B\x5B") < 0, "colors detected");

var mappy = {};

right = right.split("\n");
right.some(function(line, index) {
  if ((line.indexOf("Cannot resolve") >= 0) ||
      (line.indexOf("The file was included") >= 0)) {
    var name = path.basename(right[index - 1]);
    if (right[index].indexOf("  warning  ") >= 0) name += " (w)";
    var value = right[index].split(" as ")[1] || "";
    value = value || right[index].split("  warning  ")[1];
    if (mappy[name]) assert.equal(mappy[name], value);
    mappy[name] = value;
  }
});

var lines = Object.keys(mappy).sort().map(function(key) {
  return key + " = " + mappy[key];
}).join("\n") + "\n";

assert.equal(lines,
  "connect.js = DISCLOSED code\n" +
  "has-no-license.js = enclosed code\n" +
  "has-no-license.js (w) = Cannot resolve 'hasNoLicenseNonLiteral'\n" +
  "has-permissive-license.js = DISCLOSED code\n" +
  "has-permissive-license.js (w) = Cannot resolve 'hasPermissiveLicenseNonLiteral'\n" +
  "has-strict-license.js = enclosed code\n" +
  "has-strict-license.js (w) = Cannot resolve 'hasStrictLicenseNonLiteral'\n" +
  "package.json = DISCLOSED code\n" +
  "test-x-index.js = enclosed code\n"
);

utils.vacuum.sync(output);
