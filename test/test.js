#!/usr/bin/env node

'use strict';

const path = require('path');
const globby = require('globby');
const utils = require('./utils.js');

const target = process.argv[2];
const files = path.join(__dirname, '*/main.js');
globby.sync(files).sort().some(function (file) {
  file = path.resolve(file);
  try {
    utils.spawn.sync(
      'node', [ path.basename(file), target ],
      { cwd: path.dirname(file), stdio: 'inherit' }
    );
  } catch (error) {
    console.log(file, 'FAILED');
    throw error;
  }
  console.log(file, 'ok');
});
