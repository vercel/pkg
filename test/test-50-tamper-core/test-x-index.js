'use strict';

var fsname = 'fs';
var fs = require(fsname);
var pathname = 'path';
var pathp = require.resolve(pathname);
var path = require(pathp);

console.log([

  typeof fs,
  fs ? typeof fs.statSync : 'empty',
  typeof path,
  path ? typeof path.basename : 'empty'

].join('\n'));
