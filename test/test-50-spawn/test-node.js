#!/usr/bin/env node

'use strict';

var spawnSync = require('child_process').spawnSync;

var child = spawnSync(process.execPath, ['-e', 'process.stdout.write("42")'], {
  stdio: 'pipe',
  // if run under node (process.execPath points to node.exe),
  // then node ignores PKG_EXECPATH, but if run as pkged app,
  // PKG_INVOKE_NODEJS is a hack to access internal nodejs
  env: { PKG_EXECPATH: 'PKG_INVOKE_NODEJS' },
});

console.log(child.stdout.toString());
