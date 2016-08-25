'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('../../../node_modules/mkdirp');
var rimraf = require('../../../node_modules/rimraf');

mkdirp.sync('scripts');

var drivelistPath = path.dirname(require.resolve('drivelist'));
var scriptsPath = path.join(drivelistPath, '..', 'scripts');
fs.readdirSync(scriptsPath).some(function (file) {
  var full = 'scripts/' + file;
  var source = fs.readFileSync(path.join(scriptsPath, file));
  fs.writeFileSync(full, source);
  fs.chmodSync(full, 511); // 777
});

var drivelist = require('drivelist');
drivelist.list(function (error, list) {
  if (error) throw error;
  rimraf.sync('scripts');
  if (list.length > 0) {
    console.log('ok');
  }
});
