'use strict';

var serialport = require('serialport');
if (typeof serialport.list === 'function') {
  console.log('ok');
}
