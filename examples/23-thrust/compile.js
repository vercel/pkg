#!/usr/bin/env node

"use strict";

var flags = [];
var enclose = require("../../").exec;

try {
  require.resolve("node-thrust");
} catch (error) {
  console.log("Failed to require('node-thrust')");
  console.log("Please run 'npm install' here");
  process.exit(1);
}

flags.push("./index.js");
enclose(flags);
