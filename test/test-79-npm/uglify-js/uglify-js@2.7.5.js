'use strict';

var ujs = require('uglify-js');
var code = '40 + 2';
var ast = ujs.parse(code, {});
if (ast.body[0].body.operator === '+') {
  var code2 = 'var b = function () {};';
  var result = ujs.minify(code2, { fromString: true });
  if (result.code === 'var b=function(){};') {
    console.log('ok');
  }
}
