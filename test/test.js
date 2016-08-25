#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const globby = require('globby');
const path = require('path');
const utils = require('./utils.js');

const target = process.argv[2];
if (!target) {
  console.log(`> ${chalk.red('ERR!')} Specify a target 'v4', 'v6' etc`);
  process.exit(2);
}

const files = path.join(__dirname, '*/main.js');
globby.sync(files).sort().some(function (file) {
  file = path.resolve(file);
  try {
    utils.spawn.sync(
      'node', [ path.basename(file), target ],
      { cwd: path.dirname(file), stdio: 'inherit' }
    );
  } catch (error) {
    console.log();
    console.log(`> ${chalk.red('ERR!')} ${error.message}`);
    console.log(`> ${chalk.red('ERR!')} ${file} FAILED`);
    process.exit(2);
  }
  console.log(file, 'ok');
});
