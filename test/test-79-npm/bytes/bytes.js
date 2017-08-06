'use strict';

var bytes = require('bytes');
if (bytes(1024 * 1.7, { decimalPlaces: 0 }) === '2kB') {
  console.log('ok');
}
