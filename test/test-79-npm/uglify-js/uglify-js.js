'use strict';

var ujs = require('uglify-js');
var code = 'var b = function () {};';
var result = ujs.minify(code);
if (result.code === 'var b=function(){};') {
  console.log('ok');
}
