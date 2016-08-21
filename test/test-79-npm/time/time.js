'use strict';

let time = require('time');
let now = new time.Date();
now.setTimezone('America/Los_Angeles');
let s = now.toString();
if (s.length > 5) {
  console.log('ok');
}
