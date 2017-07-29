'use strict';

var fs = require('fs');
var path = require('path');

var Compiler = require('google-closure-compiler').compiler;
var packagePath = path.dirname(require.resolve('google-closure-compiler'));
var jarPath = path.join(packagePath, 'compiler.jar');

if (process.pkg) {
  fs.writeFileSync(Compiler.JAR_PATH, fs.readFileSync(jarPath));
  fs.unlinkSync(Compiler.JAR_PATH);
}

console.log('ok');

// TODO try to avoid storing assets here and in drive list
// figure out another way of referring to process.execPath directory
