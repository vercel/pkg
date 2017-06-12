'use strict';

var path = require('path');
var sizeOf = require('image-size');
var dimensions = sizeOf(path.join(__dirname, 'viewbox.svg'));
if (dimensions.width === 123) {
  console.log('ok');
}
