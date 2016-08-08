#!/usr/bin/env node

"use strict";

var o = {
  p: process.platform,
  a: require("../../bin/enclose.js").arch(),
  m: parseInt(process.versions.modules, 10)
};

if (module.parent) {
  module.exports = o;
} else {
  process.stdout.write(JSON.stringify(o));
}
