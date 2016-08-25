'use strict';

var time = require('time');
var now = new time.Date();
now.setTimezone('America/Los_Angeles');
var s = now.toString();
if (s.length > 5) {
  console.log('ok');
}
