'use strict';

var callsites = require('callsites');
if (callsites().length >= 4) {
  console.log('ok');
}
