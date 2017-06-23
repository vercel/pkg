#!/usr/bin/env node

'use strict';

// AppVeyor: unquoted execPath inside 'Program Files'
if (process.platform === 'win32') return;
var exec = require('child_process').exec;

var child = exec(
  process.execPath + ' ' + [
    require.resolve('./test-exec-child.js'), 'argvx', 'argvy'
  ].join(' ')
);

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

child.on('exit', function (code) {
  setTimeout(function () {
    console.log('Child exited with code', code);
  }, 100);
});
