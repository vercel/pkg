#!/usr/bin/env node

"use strict";

var p = process;
var suffix = p.platform + "-" + p.arch;
var addon = "./serialport." + suffix + ".node";
var path = require("path");

var addons = [
  "./serialport.darwin-x64.node",
  "./serialport.linux-ia32.node",
  "./serialport.linux-x64.node",
  "./serialport.win32-ia32.node",
  "./serialport.win32-x64.node"
];

if (/^v?0.12./.test(p.version)) {
  if (suffix === "win32-ia32") {
    // чтоб система не путала CONTENT и native addon
    path.join(__dirname, "serialport.win32-ia32.node");
    // чтобы показать warning про нативный аддон
    require("./serialport.win32-ia32.node");
  }
  if (addons.indexOf(addon) >= 0) {
    console.log(typeof (require(addon).set));
  } else {
    console.log("function");
  }
} else {
  console.log("function");
}
