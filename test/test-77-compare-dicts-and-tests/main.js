#!/usr/bin/env node

"use strict";

var fs = require("fs");
var path = require("path");
var assert = require("assert");

var dicts = fs.readdirSync("../../dictionary");
dicts = dicts.map(function(dict) {
  assert.equal(dict.slice(-3), ".js");
  return dict.slice(0, -3);
});

var tests = fs.readdirSync("../test-79-npm");
tests = tests.filter(function(test) {
  if (test === "z-isolator") return false;
  var full = path.join("../test-79-npm", test);
  return fs.statSync(full).isDirectory();
});

tests.push("etc"); // TODO who creates it?
tests.push("sails"); // too big to test. TODO
tests.push("steam-resources"); // absent in npm. installed via github

dicts.push("etc"); // TODO who creates it?
dicts.push("express-with-jade");
dicts.push("nodegit"); // too big to test. TODO
dicts.push("redis-with-hiredis");

var absent = false;

dicts.some(function(dict) {
  if (tests.indexOf(dict) < 0) {
    console.log(dict + " is absent in tests");
    absent = true;
  }
});

tests.some(function(test) {
  if (dicts.indexOf(test) < 0) {
    console.log(test + " is absent in dicts");
    absent = true;
  }
});

assert(!absent);
