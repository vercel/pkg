'use strict';

var pathToCompiler = require('google-closure-compiler-java');
if (pathToCompiler.indexOf('snapshot') < 0) {
  console.log('ok');
}
