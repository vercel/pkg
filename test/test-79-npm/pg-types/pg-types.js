'use strict';

require('pg-types');
var scriptToCheck = 'pg-types/lib/textParsers.js';
require(scriptToCheck, 'must-exclude');
console.log('ok');
