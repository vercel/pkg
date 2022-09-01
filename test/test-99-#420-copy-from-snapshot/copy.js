#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const testPath = path.resolve(__dirname, 'input/test.json');
console.log(fs.readFileSync(testPath, 'utf8'));

const syncPath = path.resolve(process.cwd(), 'output/sync.json');
fs.copyFileSync(testPath, syncPath);
console.log(fs.readFileSync(syncPath, 'utf8'));

const asyncPath = path.resolve(process.cwd(), 'output/async.json');
fs.copyFile(testPath, asyncPath, (err) => {
  if (err) throw err;
  console.log(fs.readFileSync(asyncPath, 'utf8'));
});
