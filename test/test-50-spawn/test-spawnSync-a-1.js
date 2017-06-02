#!/usr/bin/env node

'use strict';

var spawnSync = require('child_process').spawnSync;

spawnSync(
  process.execPath, [
    require.resolve('./test-spawnSync-a-child.js')
  ], { stdio: [ 'inherit', 'inherit', 'inherit' ] }
);
