'use strict';

// only enclosed run supposed
if (!process.enclose) {
  console.log('ok');
  return;
}

var require2 = require('require-uncached');

try {
  require2('async');
} catch (error) {
  if (error.message.indexOf('EncloseJS') >= 0) {
    console.log('ok');
  }
}
