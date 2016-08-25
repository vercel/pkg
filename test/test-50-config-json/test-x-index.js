/* eslint-disable camelcase */
/* eslint-disable no-useless-concat */

'use strict';

var the_A = './test-y-' + 'resolve-A.js';
var the_B = './test-y-' + 'resolve-B.txt';
var the_C = './test-y-' + 'resolve-C.json';

console.log([
  require(the_A).toString(),
  require(the_B).toString(),
  require(the_C).toString()
].join('\n'));
