'use strict';

var fs = require('fs');
var path = require('path');

if (process.platform === 'win32') {
  var root = path.parse(process.argv[1]).root; // D:\\
  if (fs.statSync(root + 'snapshot').isDirectory()) {
    var root2 = root.slice(0, 2) + '/';
    if (fs.statSync(root2 + 'snapshot').isDirectory()) {
      try {
        fs.statSync('/snapshot');
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log('ok');
        }
      }
    }
  }
} else {
  if (fs.statSync('/snapshot').isDirectory()) {
    try {
      fs.statSync('K:\\snapshot');
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('ok');
      }
    }
  }
}
