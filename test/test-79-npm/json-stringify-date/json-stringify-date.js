'use strict';

let stringify = require('json-stringify-date');
let obj = { d: new Date(2014, 2, 4) };
let s = stringify.stringify(obj);
if (s.indexOf('2014') >= 0) {
  console.log('ok');
}
