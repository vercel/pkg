'use strict';

var promisify = require('util').promisify;
if (!promisify) return console.log('ok');

var execAsync = promisify(require('child_process').exec);
var existsAsync = promisify(require('fs').exists)

execAsync('whoami').then(function (output) {
  console.log(output);
  existsAsync('./main.js').then(function (existence) {
    console.log(existence);
  });
});
