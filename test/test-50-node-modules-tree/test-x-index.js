'use strict';

var fs = require('fs');
var path = require('path');

console.log([

  require('./test-y-fish-A'),
  require('test-y-fish-B'),

//  fs.readFileSync(require.resolve("./test-y-fish-E"), "utf8"),
//  fs.readFileSync(require.resolve("test-y-fish-F"), "utf8"),
  fs.readFileSync(path.join(__dirname, './test-y-fish-G'), 'utf8'),
  fs.readFileSync(path.join(__dirname, 'test-y-fish-H'), 'utf8'),

  fs.existsSync('./test-y-fish-C').toString(),
  fs.existsSync('test-y-fish-D').toString(),
//  fs.existsSync(require.resolve("./test-y-fish-E")).toString(),
//  fs.existsSync(require.resolve("test-y-fish-F")).toString(),
  fs.existsSync(path.join(__dirname, './test-y-fish-G')).toString(),
  fs.existsSync(path.join(__dirname, 'test-y-fish-H')).toString(),

  require('test-y-fish-I'), // разница в node_modules\test-y-fish-I\index.js
  require('test-y-fish-J'),
  JSON.stringify(require('test-y-fish-M')),
  JSON.stringify(require('test-y-fish-N')),
  require('test-y-fish-O'),
  require('test-y-fish-P'),

  require('test-y-fish-R')

].join('\n'));
