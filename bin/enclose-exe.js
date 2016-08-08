#!/usr/bin/env node

/* eslint-disable no-bitwise */

"use strict";

var fs = require("fs");
var path = require("path");
var async = require("async");
var windows = process.platform === "win32";

var bundler = require("../lib/bundler.js");
var producer = require("../lib/producer.js");
var reporter = require("../lib/reporter.js");

var cli;

async.waterfall([
  function(next) {

    try {
      cli = require("./enclose-exe-cli.js");
      return next();
    } catch (error) {
      reporter.report("", "error", error.message, error);
      return next(error);
    }

  },
  function(next) {

    // loglevel must be set as early as possible

    if (cli.loglevel) {
      if (!reporter.isCorrectLevel(cli.loglevel)) {
        var error = new Error("Bad loglevel: " + cli.loglevel);
        reporter.report("", "error", error.message, error);
        return next(error);
      }
      reporter.level = cli.loglevel;
    }

    next();

  },
  function(next) {

    var home = path.dirname(process.argv[1]);
    var dictionary = path.join(home, "..", "dictionary");

    if (!fs.existsSync(dictionary)) {
      var error = new Error("Dictionary directory not found");
      reporter.report("", "error", error.message, error);
      return next(error);
    }

    next();

  },
  function(next) {

    bundler({
      cli: cli
    }, next);

  },
  function(stripe, next) {

    var pathToHouseSize = path.join(__dirname, "house.size");
    var houseSize = fs.readFileSync(pathToHouseSize, "utf8") | 0;

    producer({
      stripe: stripe,
      houseSize: houseSize
    }, next);

  },
  function(product, next) {

    fs.writeFile(cli.output, product, next);

  },
  function(next) {

    if (!windows) {
      return fs.stat(cli.output, function(error, stat) {
        if (error) return next(error);
        var plusx = (stat.mode | 64 | 8).toString(8).slice(-3);
        fs.chmod(cli.output, plusx, next);
      });
    }

    next();

  }
], function(error) {

  process.once("exit", function() {
    reporter.finish();
    if (error && error.wasReported) {
      process.exit(1);
    }
  });

  if (error) {
    if (error.wasReported) return;
    throw error;
  }

});
