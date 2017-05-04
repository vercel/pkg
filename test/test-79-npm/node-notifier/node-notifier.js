'use strict';

var notifier = require('node-notifier');
var utils = require('node-notifier/lib/utils.js');
utils.fileCommandJson = function (filename) {
  if (!(/^\/snapshot\//.test(filename))) {
    console.log('ok');
  }
  process.exit();
};
notifier.notify('hi!');
