require('pg-types');
let scriptToCheck = 'pg-types/lib/textParsers.js';
require(scriptToCheck, 'dont-enclose');
console.log('ok');
