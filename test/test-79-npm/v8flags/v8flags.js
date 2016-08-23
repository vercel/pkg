'use strict';

let fs = require('fs');
let path = require('path');
let home = require('user-home');
let cp = require('child_process');

let files = fs.readdirSync(home);
files.some(function (file) {
  if (/^\.v8flags/.test(file)) {
    fs.unlinkSync(path.join(home, file));
  }
});

let execFileCalled = false;
let execFileSave = cp.execFile;

cp.execFile = function () {
  execFileCalled = true;
  execFileSave.apply(cp, arguments); // eslint-disable-line prefer-rest-params
};

setTimeout(function () {

  let v8flags = require('v8flags');
  v8flags(function (error, results) {
    if (error) return;
    if (!Array.isArray(results)) return;
    if (results.length < 6) return;
    if (!execFileCalled) return;
    console.log('ok');
  });

}, 500);
