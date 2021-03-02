'use strict';

var fs = require('fs');

var dataPath1 = 'delta';
require(dataPath1);
console.log(global.FOO);

var dataPath2 = 'normalize.css';
var css = fs.readFileSync(require.resolve(dataPath2), 'utf8');
console.log(css);
