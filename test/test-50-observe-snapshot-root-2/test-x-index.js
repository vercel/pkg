#!/usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');

if (process.platform === 'win32') {
  var root = path.parse(process.argv[1]).root; // D:\\
  if (fs.readdirSync(root).indexOf('snapshot') >= 0) {
    fs.readdir(root, function (error, entries) {
      if (error) throw error;
      if (entries.indexOf('snapshot')) {
        console.log('ok');
      }
    });
  }
} else {
  if (fs.readdirSync('/').indexOf('snapshot') >= 0) {
    fs.readdir('/', function (error, entries) {
      if (error) throw error;
      if (entries.indexOf('snapshot')) {
        console.log('ok');
      }
    });
  }
}
