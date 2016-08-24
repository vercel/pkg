'use strict';

var fs = require('fs');
var path = require('path');

console.log([

  require('test-y-fish'), // both should have same names
  fs.readFileSync(path.join(__dirname, 'test-y-fish'))

].join('\n'));
