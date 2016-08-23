'use strict';

let floordate = require('floordate');
let d = new Date();
let v = floordate(d, 'year').getFullYear();
if ((v > 2015) && (v < 2075)) {
  console.log('ok');
}
