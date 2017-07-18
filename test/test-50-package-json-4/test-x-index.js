'use strict';

require('busboy');
var dataPath1 = 'busboy/lib/types/test-y-require.js';
var data1 = require(dataPath1);
console.log(data1);

require('log4js/index.js');
var dataPath2 = 'log4js/lib/appenders/test-z-require.js';
var data2 = require(dataPath2);
console.log(data2);
