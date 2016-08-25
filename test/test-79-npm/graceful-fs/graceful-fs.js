'use strict';

// only enclosed run supposed
if (!process.enclose) {
  console.log('ok');
  return;
}

var fs = require('graceful-fs');
var hack = 'dirty-hack-for-testing-purposes';
if (fs.readFileSync(hack) === hack) {
  console.log('ok');
}
