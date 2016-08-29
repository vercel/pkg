'use strict';

// only pkg-ed run
if (!process.pkg) {
  console.log('ok');
  return;
}

var require2 = require('require-uncached');

try {
  require2('async');
} catch (error) {
  if (error.message.indexOf('Pkg') >= 0) {
    console.log('ok');
  }
}
