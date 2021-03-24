'use strict';

var colors = require('colors');

if (typeof colors.green === 'function') {
  var gopd = Object.getOwnPropertyDescriptor;
  var grass = gopd(String.prototype, 'green');
  if (grass && typeof grass.get === 'function') {
    console.log('ok');
  }
}
