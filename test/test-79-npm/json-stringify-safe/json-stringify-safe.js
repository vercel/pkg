let stringify = require('json-stringify-safe');
let circularObj = {};
circularObj.circularRef = circularObj;
circularObj.list = [ circularObj, circularObj ];
console.error(stringify(circularObj, null, 2));
console.log('ok');
