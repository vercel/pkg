'use strict';

var fs = require('fs');
var Compiler = require('google-closure-compiler').compiler;
if (
  fs.existsSync(Compiler.JAR_PATH) &&
  Compiler.JAR_PATH.indexOf('snapshot') < 0
) {
  console.log('ok');
}
