/* eslint-disable no-useless-concat */

'use strict';

var theA = './test-y-' + 'resolve-A.js';
var theB = './test-y-' + 'resolve-B.txt';
var theC = './test-y-' + 'resolve-C.json';

console.log([
  require(theA).toString(),
  require(theB).toString(),
  require(theC).toString()
].join('\n'));
