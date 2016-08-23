'use strict';

let moment = require('moment-timezone');
let june = moment('2014-06-01T12:00:00Z');
let s = june.tz('America/Los_Angeles').format('ha z');
if (s === '5am PDT') {
  console.log('ok');
}
