'use strict';

var fs = require('fs');
var path = require('path');

if (process.platform === 'win32') {
  var root = path.parse(process.argv[1]).root; // D:\\
  if (fs.readdirSync(root).indexOf('snapshot') >= 0) {
    var root2 = root.slice(0, 2) + '/';
    if (fs.readdirSync(root2).indexOf('snapshot') >= 0) {
      fs.readdir(root, function (error, entries) {
        if (error) throw error;
        if (entries.indexOf('snapshot')) {
          fs.readdir(root2, function (error2, entries2) {
            if (error2) throw error2;
            if (entries2.indexOf('snapshot')) {
              console.log('ok');
            }
          });
        }
      });
    }
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
