'use strict';

var fs = require('fs');
var path = require('path');
var spawn = require('cross-spawn-async');
var bin = path.join(__dirname, 'fixture.js');
var args = [];

if (process.pkg) {
  args.unshift(bin);
  bin = process.execPath;
} else {
  fs.chmodSync(bin, 511);
}

spawn(bin, args, { stdio: 'inherit' });
