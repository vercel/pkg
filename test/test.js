#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const globby = require('globby');
const path = require('path');
const utils = require('./utils.js');
const host = 'node' + process.version.match(/^v(\d+)/)[1];
let target = process.argv[2] || 'host';
if (target === 'host') target = host;
const flavor = process.argv[3] || 'all';

console.log('');
console.log('*************************************');
console.log(target + ' ' + flavor);
console.log('*************************************');
console.log('');

if (process.env.CI) {
  if (target === 'node0' ||
      target === 'node4' ||
      target === 'node7' ||
      target === 'node9') {
    console.log(target + ' is skipped in CI!');
    console.log('');
    process.exit();
  }
}

const list = [];

if (flavor === 'only-npm') {
  list.push(path.join(__dirname, 'test-79-npm/main.js'));
} else {
  list.push(path.join(__dirname, '*/main.js'));
  if (flavor === 'no-npm') {
    list.push('!' + path.join(__dirname, 'test-42-fetch-all'));
    list.push('!' + path.join(__dirname, 'test-79-npm'));
  }
}

const files = globby.sync(list);

files.sort().some(function (file) {
  file = path.resolve(file);
  try {
    utils.spawn.sync(
      'node', [ path.basename(file), target ],
      { cwd: path.dirname(file), stdio: 'inherit' }
    );
  } catch (error) {
    console.log();
    console.log(`> ${chalk.red('Error!')} ${error.message}`);
    console.log(`> ${chalk.red('Error!')} ${file} FAILED (in ${target})`);
    process.exit(2);
  }
  console.log(file, 'ok');
});
