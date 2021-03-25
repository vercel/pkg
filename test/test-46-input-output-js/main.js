#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const input = './test-x-index.js';
const exe = process.platform === 'win32' ? '.exe' : '';
const newcomers = ['test-output' + exe];
const before = utils.filesBefore(newcomers);

utils.pkg.sync(['--output', 'test-output', input], { stdio: 'inherit' });

utils.filesAfter(before, newcomers);
