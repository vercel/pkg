/* eslint-disable no-underscore-dangle */

"use strict";

process.stdout._write_ = process.stdout.write;
process.stdout.write = function() {};
console._log_ = function(m) {
  process.stdout._write_(m + "\n");
};
console.log = function() {};

require("gulp"); // pullup
require("gulp-concat"); // pullup
require("gulp/bin/gulp.js");
