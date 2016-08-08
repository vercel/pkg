#!/usr/bin/env node

"use strict";

var flags = [];
var platform = process.platform;
var enclose = require("../../").exec;
var windows = platform === "win32";
var extension = windows ? ".exe" : "";

try {
  require.resolve("npm");
} catch (error) {
  console.log("Failed to require('npm')");
  console.log("Please run 'npm install' here");
  process.exit(1);
}

flags.push("--output", "./npm" + extension);
flags.push("./index.js");
enclose(flags);
