#!/usr/bin/env node

'use strict';

var exec = require('child_process').exec;

var child = exec(
  JSON.stringify(process.execPath) + ' ' + [
    require.resolve('./test-exec-child.js'), 'argvx', 'argvy'
  ].join(' '), { stdio: 'inherit' }
);

child.on('exit', function (code) {
  console.log(code);
  console.log('Child exited');
});
