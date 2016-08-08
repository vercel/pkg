#!/usr/bin/env node

"use strict";

var fs = require("fs");
var assert = require("assert");
assert.equal(__dirname, process.cwd());

var arg = process.argv[2];
var lines = fs.readFileSync(arg, "utf8").split("\n");
if (lines.length === 0) return;

var results = [];

lines.some(function(line) {
  if (/^diff/.test(line)) {
    results.push(line);
  }
  if (/^index/.test(line)) {
    results.push(line);
  }
  if (/^\+/.test(line)) {
    if (/^\+\+\+/.test(line)) {
      results.push(line);
    } else
    if (/^\+@@/.test(line)) {
      // results.push("+@@");
    } else {
      results.push(line);
    }
  }
  if (/^-/.test(line)) {
    if (/^---/.test(line)) {
      results.push(line);
    } else
    if (/^-@@/.test(line)) {
      // results.push("-@@");
    } else {
      results.push(line);
    }
  }
});

fs.writeFileSync(arg, results.join("\n") + "\n");
