'use strict';

var fs = require('fs');
var path = require('path');

var myDirectory = path.dirname(process.execPath);

process.pkg.mount(
  new RegExp(path.join('^', __dirname, 'regexp_mountpoint_test/(.*)$')),
  function (match, group1) {
    return path.join(myDirectory, 'plugins-D-ext', group1);
  }
);

require('./regexp_mountpoint_test/test-y-require-D.js'.slice());

console.log(fs.readdirSync(__dirname).join('\n'));
