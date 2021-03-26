#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const input = '.';

const newcomers = [
  'palookaville-linux',
  'palookaville-macos',
  'palookaville-win.exe',
];

const before = utils.filesBefore(newcomers);

utils.pkg.sync([input], { stdio: 'inherit' });

utils.filesAfter(before, newcomers);
