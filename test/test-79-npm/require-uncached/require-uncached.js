'use strict';

require('acorn'); // in order to take
var require2 = require('require-uncached');
const dep = 'acorn';
var result = require2(dep);
if (typeof result !== 'undefined') {
  console.log('ok');
}
