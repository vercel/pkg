'use strict';

require('pg-types');
var scriptToCheck = 'pg-types/lib/textParsers.js';
require(scriptToCheck, 'dont-enclose');
console.log('ok');
