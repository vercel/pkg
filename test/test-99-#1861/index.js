#!/usr/bin/env node

'use strict';

const { spawn } = require('child_process');

const { argv } = process;

if (argv.length <= 2) {
  console.log('stop');
  process.exit();
}

console.log('launch');

const cp = spawn('cmd.exe', ['/C', 'launch.bat'], { shell: true });
cp.stdout.on('data', (output) => console.log(output.toString()));
cp.on('close', process.exit);
