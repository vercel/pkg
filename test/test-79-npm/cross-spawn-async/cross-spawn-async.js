'use strict';

let fs = require('fs');
let path = require('path');
let spawn = require('cross-spawn-async');
let bin = path.join(__dirname, 'fixture.js');
let args = [];

if (process.enclose) {
  args.unshift('--entrypoint', bin);
  bin = process.execPath;
} else {
  fs.chmodSync(bin, 511);
}

spawn(bin, args, { stdio: 'inherit' });
