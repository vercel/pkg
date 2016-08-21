'use strict';

let fsname = 'fs';
let fs = require(fsname);
let pathname = 'path';
let pathp = require.resolve(pathname);
let path = require(pathp);

console.log([

  typeof fs,
  fs ? typeof fs.statSync : 'empty',
  typeof path,
  path ? typeof path.basename : 'empty'

].join('\n'));
