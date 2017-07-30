'use strict';

var fs = require('fs');
var path = require('path');
var notifier = require('node-notifier');
var utils = require('node-notifier/lib/utils.js');
var whichArgument;

utils.command = utils.fileCommandJson = utils.immediateFileCommand = function (filename) {
  if ((fs.existsSync(filename) ||
       // notifier is built-in on linux
       filename === whichArgument) &&
      path.isAbsolute(filename) &&
      filename.indexOf('snapshot') < 0) {
    console.log('ok');
  }
  process.exit();
};

var which = require('which');
which.sync = function (filename) {
  whichArgument = filename;
  return true;
};

notifier.notify('hi!');
