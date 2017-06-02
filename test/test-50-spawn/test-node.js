#!/usr/bin/env node

'use strict';

var spawnSync = require('child_process').spawnSync;

var child = spawnSync(
  process.execPath, [
    '-e', 'process.stdout.write("42")'
  ], { stdio: 'pipe' }
);

console.log(child.stdout.toString());
