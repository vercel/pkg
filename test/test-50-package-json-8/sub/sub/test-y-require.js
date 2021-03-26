'use strict';

var assert = require('assert');

function main() {
  require('../test-z-require.js');
}

if (process.pkg) {
  assert(main.toString().indexOf('test') < 0);
}

main();
