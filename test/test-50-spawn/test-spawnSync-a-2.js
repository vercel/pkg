#!/usr/bin/env node

'use strict';

var spawnSync = require('child_process').spawnSync;

spawnSync(
  process.execPath, [
    require.resolve('./test-spawnSync-a-child.js'), 'argvx', 'argvy'
  ], { stdio: [ 'inherit', 'inherit', 'inherit' ] }
);
