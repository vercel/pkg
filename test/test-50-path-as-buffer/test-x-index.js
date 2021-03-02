'use strict';

var fs = require('fs');
var path = require('path');
var hasURL = typeof URL !== 'undefined';

var d = __dirname;
var f = path.join(__dirname, 'test-z-asset.css');

console.log(fs.statSync(f).size);
console.log(fs.statSync(Buffer.from(f)).size);
if (hasURL) console.log(fs.statSync(new URL('file://' + f)).size);

console.log(fs.readdirSync(d).includes('test-z-asset.css'));
console.log(fs.readdirSync(Buffer.from(d)).includes('test-z-asset.css'));
if (hasURL) console.log(fs.readdirSync(new URL('file://' + d)).includes('test-z-asset.css'));
