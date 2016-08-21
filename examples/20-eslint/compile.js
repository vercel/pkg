#!/usr/bin/env node

let flags = [];
let platform = process.platform;
let enclose = require('../../').exec;
let windows = platform === 'win32';
let extension = windows ? '.exe' : '';

try {
  require.resolve('eslint');
} catch (error) {
  console.log('Failed to require(\'eslint\')');
  console.log('Please run \'npm install\' here');
  process.exit(1);
}

flags.push('--output', './eslint' + extension);
flags.push('./index.js');
enclose(flags);
