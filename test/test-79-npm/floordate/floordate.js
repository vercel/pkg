'use strict';

var floordate = require('floordate');
var d = new Date();
var v = floordate(d, 'year').getFullYear();
if (v > 2015 && v < 2075) {
  console.log('ok');
}
