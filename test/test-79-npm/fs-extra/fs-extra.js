'use strict';

// only enclosed run supposed
if (!process.enclose) {
  console.log('ok');
  return;
}

let fs = require('fs-extra');
let hack = 'dirty-hack-for-testing-purposes';
if (fs.readFileSync(hack) === hack) {
  console.log('ok');
}
