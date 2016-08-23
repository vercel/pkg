#!/usr/bin/env node

/* eslint-disable no-bitwise */

'use strict';

let fs = require('fs');
let path = require('path');
let async = require('async');
let windows = process.platform === 'win32';
let pkgCache = require('pkg-cache');

let bundler = require('../lib/bundler.js');
let producer = require('../lib/producer.js');
let reporter = require('../lib/reporter.js');

let cli;

async.waterfall([
  function (next) {

    try {
      cli = require('./enclose-exe-cli.js');
      return next();
    } catch (error) {
      reporter.report('', 'error', error.message, error);
      return next(error);
    }

  },
  function (next) {

    // loglevel must be set as early as possible

    if (cli.loglevel) {
      if (!reporter.isCorrectLevel(cli.loglevel)) {
        let error = new Error('Bad loglevel: ' + cli.loglevel);
        reporter.report('', 'error', error.message, error);
        return next(error);
      }
      reporter.level = cli.loglevel;
    }

    next();

  },
  function (next) {

    let home = path.dirname(process.argv[1]);
    let dictionary = path.join(home, '..', 'dictionary');

    if (!fs.existsSync(dictionary)) {
      let error = new Error('Dictionary directory not found');
      reporter.report('', 'error', error.message, error);
      return next(error);
    }

    next();

  },
  function (next) {

    bundler({
      cli: cli
    }, next);

  },
  function (stripe, next) {

    pkgCache.need({
      nodeRange: cli.version
    }).then(function (fabricatorName) {

      producer({
        stripe: stripe,
        fabricatorName: fabricatorName
      }, next);

    }, next);

  },
  function (product, next) {

    fs.writeFile(cli.output, product, next);

  },
  function (next) {

    if (!windows) {
      return fs.stat(cli.output, function (error, stat) {
        if (error) return next(error);
        let plusx = (stat.mode | 64 | 8).toString(8).slice(-3);
        fs.chmod(cli.output, plusx, next);
      });
    }

    next();

  }
], function (error) {

  process.once('exit', function () {
    reporter.finish();
    if (error && error.wasReported) {
      process.exit(1);
    }
  });

  if (error) {
    if (error.wasReported) return;
    reporter.report('', 'error', [ error.stack ], error);
  }

});
