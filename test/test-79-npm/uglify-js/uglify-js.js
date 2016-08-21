'use strict';

let ujs = require('uglify-js');
let code = '40 + 2';
let ast = ujs.parse(code, {});
if (ast.body[0].body.operator === '+') {
  let code2 = 'var b = function () {};';
  let result = ujs.minify(code2, { fromString: true });
  if (result.code === 'var b=function(){};') {
    console.log('ok');
  }
}
