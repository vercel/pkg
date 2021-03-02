'use strict';

var compressjs = require('compressjs');
var algorithm = compressjs.Lzp3;

if (algorithm.MAGIC === 'lzp3') {
  console.log('ok');
}
