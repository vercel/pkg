#!/usr/bin/env node

"use strict";

var fs = require("fs");
var assert = require("assert");
assert.equal(__dirname, process.cwd());

var arg = process.argv[2];
var lines = fs.readFileSync(arg, "utf8").split("\n");
if (lines.length === 0) return;
if (/^---/.test(lines[0])) return;
lines = lines.slice(6);

var results = [];

lines.some(function(line) {
  if (/^diff/.test(line)) return;
  if (/^index/.test(line)) return;
  if (/^--- a\//.test(line)) {
    results.push(line.replace(/^--- a\//, "--- node/"));
    return;
  }
  if (/^\+\+\+ b\//.test(line)) {
    results.push(line.replace(/^\+\+\+ b\//, "+++ node/"));
    return;
  }
  if (/^@@/.test(line)) {
    results.push("@@" + line.split("@@")[1] + "@@");
    return;
  }
  results.push(line);
});

fs.writeFileSync(arg, results.join("\n"));
