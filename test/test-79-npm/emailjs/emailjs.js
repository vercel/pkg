'use strict';

var emailjs = require('emailjs');
if (typeof emailjs.server.connect === 'function') {
  console.log('ok');
}
