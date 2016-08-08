"use strict";

var config = require("interpret").extensions;
var rechoir = require("rechoir");
rechoir.prepare(config, "./fixture.coffee");
var coffee = require("./fixture.coffee", "dont-enclose");

if (typeof coffee.root === "function") {
  console.log("ok");
}
