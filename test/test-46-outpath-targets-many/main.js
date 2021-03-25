#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const input = './test-x-index';

const newcomers = [
  'out/test-x-index-linux',
  'out/test-x-index-macos',
  'out/test-x-index-win.exe',
];

const before = utils.filesBefore(newcomers);

utils.pkg.sync(['--target', 'linux,macos,win', '--out-path', 'out', input]);

utils.filesAfter(before, newcomers);
utils.vacuum.sync('out');
