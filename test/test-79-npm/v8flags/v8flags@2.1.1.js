'use strict';

var fs = require('fs');
var path = require('path');
var home = require('user-home');
var cp = require('child_process');

var files = fs.readdirSync(home);
files.some(function (file) {
  if (/^\.v8flags/.test(file)) {
    fs.unlinkSync(path.join(home, file));
  }
});

var execFileCalled = false;
var execFileSave = cp.execFile;

cp.execFile = function () {
  execFileCalled = true;
  execFileSave.apply(cp, arguments); // eslint-disable-line prefer-rest-params
};

setTimeout(function () {
  var v8flags = require('v8flags');
  v8flags(function (error, results) {
    if (error) return;
    if (!Array.isArray(results)) return;
    if (results.length < 6) return;
    if (!execFileCalled) return;
    console.log('ok');
  });
}, 500);
