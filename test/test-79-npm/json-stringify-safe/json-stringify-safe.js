'use strict';

var stringify = require('json-stringify-safe');
var circularObj = {};
circularObj.circularRef = circularObj;
circularObj.list = [circularObj, circularObj];
console.error(stringify(circularObj, null, 2));
console.log('ok');
