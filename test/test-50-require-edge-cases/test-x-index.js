"use strict";

console.log([

  require("./test-y-require-false.js"),
  typeof require("./test-z-empty-file.js")

].join("\n"));
