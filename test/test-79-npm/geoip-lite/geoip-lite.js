'use strict';

var geoip = require('geoip-lite');
var ip = '207.97.227.239';
var geo = geoip.lookup(ip);
if (geo.country === 'US') {
  console.log('ok');
}
