let assert = require('assert');
let common = require('../test-y-common.js');

if (__dirname.indexOf('thebox') < 0) {
  console.log(__dirname);
  assert(false);
}

common('I am D');
