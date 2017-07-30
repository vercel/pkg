'use strict';

var fs = require('fs');
var path = require('path');
var notifier = require('node-notifier');
var utils = require('node-notifier/lib/utils.js');
utils.command = utils.fileCommandJson = utils.immediateFileCommand = function (filename) {
  if (fs.existsSync(filename) &&
      path.isAbsolute(filename) &&
      filename.indexOf('snapshot') < 0) {
    console.log('ok');
  }
  process.exit();
};

var which = require('which');
which.sync = function () {
  return true;
};

notifier.notify('hi!');
