'use strict';

let geoip = require('geoip-lite');
let ip = '207.97.227.239';
let geo = geoip.lookup(ip);
if (geo.country) {
  console.log('ok');
}
