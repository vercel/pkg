'use strict';

var stringify = require('json-stringify-date');
var obj = { d: new Date(2014, 2, 4) };
var s = stringify.stringify(obj);
if (s.indexOf('2014') >= 0) {
  console.log('ok');
}
