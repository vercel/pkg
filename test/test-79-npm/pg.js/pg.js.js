'use strict';

var pg = require('pg.js');
if (pg.connect) {
  console.log('ok');
}
