'use strict';

// only pkg-ed run
if (!process.pkg) {
  console.log('ok');
  return;
}

var fs = require('fs-extra');
var hack = 'dirty-hack-for-testing-purposes';
if (fs.readFileSync(hack) === hack) {
  console.log('ok');
}
