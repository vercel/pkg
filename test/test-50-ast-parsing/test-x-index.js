#!/usr/bin/env node

"use strict";

var fs = require("fs");
var detector = require("../../lib/detector.js");
var body = fs.readFileSync("./test-y-data.txt", "utf8");

detector.detect(
  body,
  function(name, value, trying) {
    var p;
    p = detector.visitor_SUCCESSFUL(name, value, true);
    if (p) {
      if (trying) {
        console.log("try { " + p + "; } catch (_) {}");
      } else {
        console.log(p + ";");
      }
      return false;
    }
    // TODO maybe NONLITERAL and USESCWD?
    return true;
  }
);
