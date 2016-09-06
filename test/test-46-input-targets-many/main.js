#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const input = './test-x-index';

const newcomers = [
  'test-x-index-linux',
  'test-x-index-osx',
  'test-x-index-win.exe'
];

const before = utils.filesBefore(newcomers);

utils.pkg.sync([
  '--target', 'linux,osx,win',
  input
]);

utils.filesAfter(before, newcomers);
