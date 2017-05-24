'use strict';

var path = require('path');
var content = path.join(__dirname, 'test-x1-content.js');

console.log([

  require(content),
  require('./test-x2-require-false.js'),
  typeof require('./test-x3-empty-file.js')

].join('\n'));
