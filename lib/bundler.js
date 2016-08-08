"use strict";

var async = require("async");
var walker = require("./walker.js");
var packer = require("./packer.js");

var natives = Object.keys(process.binding("natives"));
natives = natives.concat("file", "system"); // CommonJS
natives = natives.reduce(function(a, b) {
  a[b] = true;
  return a;
}, {});

function bundler(opts, cb) {

  async.waterfall([
    function(next) {

      walker({
        cli: opts.cli,
        config: opts.config,
        natives: natives
      }, next);

    },
    function(records, next) {

      packer({
        records: records
      }, next);

    }
  ], cb);

}

module.exports = bundler;

if (!module.parent) {

  var stdin = "";

  process.stdin.on("data", function(chunk) {
    stdin += chunk.toString();
  });

  process.stdin.on("end", function() {
    var opts = JSON.parse(stdin);
    bundler(opts, function(error, blob) {
      if (error) throw error;
      process.stdout.write(blob);
    });
  });

}
