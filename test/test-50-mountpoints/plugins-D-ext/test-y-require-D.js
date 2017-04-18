'use strict';

var assert = require('assert');
var common = require('../test-y-common.js');

if (__dirname.indexOf('snapshot') < 0) {
  console.log(__dirname);
  assert(false);
}

common('I am D');
