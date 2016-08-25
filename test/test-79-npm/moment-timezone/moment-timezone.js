'use strict';

var moment = require('moment-timezone');
var june = moment('2014-06-01T12:00:00Z');
var s = june.tz('America/Los_Angeles').format('ha z');
if (s === '5am PDT') {
  console.log('ok');
}
