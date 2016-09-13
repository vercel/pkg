#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const globby = require('globby');
const path = require('path');
const utils = require('./utils.js');
const target = process.argv[2] || 'latest';
const modify = process.argv[3];

const list = [ path.join(__dirname, '*/main.js') ];

if (modify === 'nonpm') {
  list.push('!' + path.join(__dirname, 'test-79-npm/**/*'));
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
    console.log(`> ${chalk.red('Error!')} ${file} FAILED`);
    process.exit(2);
  }
  console.log(file, 'ok');
});
