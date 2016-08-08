#!/usr/bin/env node

/* eslint-disable no-bitwise */

"use strict";

var fs = require("fs");
var path = require("path");
var assert = require("assert");
var globby = require("globby");
var utils = require("../utils.js");
var windows = process.platform === "win32";
var extension = windows ? ".exe" : "";

assert.equal(__dirname, process.cwd());

function main(cb) {

  var info = require("./94-information.js");
  var version = info.version();
  var commit = info.commit();
  var suffix = info.suffix();

  var bundler = require("../lib/bundler.js");
  var producer = require("../lib/producer.js");

  var input = path.resolve("../bin/enclose-exe.js");
  var config = {};

  config.assets = [
    path.resolve("../bin/enclose-exe-cli.js"),
    path.resolve("../bin/house.size"),
    path.resolve("../lib/bundler.js"),
    path.resolve("../lib/common.js"),
    path.resolve("../lib/detector.js"),
    path.resolve("../lib/packer.js"),
    path.resolve("../lib/producer.js"),
    path.resolve("../lib/prelude.js"),
    path.resolve("../lib/reporter.js"),
    path.resolve("../lib/walker.js")
  ];

  config.assets = config.assets.concat(
    globby.sync([
      "../node_modules/**/*.js",
      "../node_modules/**/*.json"
    ])
  );

  bundler({
    cli: { input: input },
    config: config
  }, function(bundlerError, stripe) {

    if (bundlerError) throw bundlerError;

    var pathToHouse = path.join(
      "..", "bin", "house" + extension
    );

    var pathToHouseSize = path.join(
      "..", "bin", "house.size"
    );

    producer({
      stripe: stripe,
      house: fs.readFileSync(pathToHouse),
      fabricatorName: pathToHouse
    }, function(producerError, encloseExe) {

      if (producerError) throw producerError;

      var pathToEncloseExe = path.join(
        "..", "bin", [
          "enclose", version,
          suffix, commit
        ].join("-") + extension
      );

      fs.writeFileSync(pathToEncloseExe, encloseExe);

      if (!windows) {
        var stat = fs.statSync(pathToEncloseExe);
        var plusx = (stat.mode | 64 | 8).toString(8).slice(-3);
        fs.chmodSync(pathToEncloseExe, plusx);
      }

      // /////////////////////////////////////////////////////////////
      // /////////////////////////////////////////////////////////////
      // /////////////////////////////////////////////////////////////

      var pathToBinariesJson = path.join(
        "..", "bin", "binaries.json"
      );

      var binariesJson;

      if (fs.existsSync(pathToBinariesJson)) {
        binariesJson = JSON.parse(
          fs.readFileSync(pathToBinariesJson, "utf8")
        );
      } else {
        binariesJson = {};
      }

      var bj = binariesJson;
      var bjs = bj[suffix] = bj[suffix] || {};
      var v = version;
      if (v.slice(0, 1) === "v") v = v.slice(1);
      var major = v.split(".")[0] | 0;

      // https://nodejs.org/en/download/releases/

      var major2modules = [ 14, 0, 0, 0, 46, 47, 48 ];
      var modules = major2modules[major];
      assert(modules, "unsupported major " + major.toString());
      bjs["modules" + modules.toString()] = version;
      bjs["v" + major.toString()] = version;
      var bjsv = bjs[version] = bjs[version] || {};

      bjsv.enclose = {
        name: path.basename(pathToEncloseExe),
        size: encloseExe.length
      };

      fs.writeFileSync(
        pathToBinariesJson,
        utils.stringify(binariesJson, null, 2)
      );

      // /////////////////////////////////////////////////////////////
      // /////////////////////////////////////////////////////////////
      // /////////////////////////////////////////////////////////////

      utils.vacuum.sync(pathToHouse);
      utils.vacuum.sync(pathToHouseSize);

      cb();

    });

  });

}

module.exports = function(cb) {
  main(function() {
    console.log(__filename, "ok");
    if (cb) return cb();
  });
};

if (!module.parent) {
  module.exports();
}
