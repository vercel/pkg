'use strict';

var shell = require('shelljs');
var windows = process.platform === 'win32';
var result = shell.exec(windows ? 'dir' : 'ls', { silent: true });
var data = result.stdout || result.output;
if (data.length >= 2) {
  console.log('ok');
}
