'use strict';

var fs = require('fs');
var path = require('path');
var notifier = require('node-notifier');
var utils = require('node-notifier/lib/utils.js');
var whichArgument;

utils.command =
  utils.fileCommandJson =
  utils.immediateFileCommand =
    function (filename) {
      var forLinux = filename === whichArgument; // 'notify-send' is built-in on linux
      var forNonLinux = fs.existsSync(filename) && path.isAbsolute(filename);
      if ((forLinux || forNonLinux) && filename.indexOf('snapshot') < 0) {
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
