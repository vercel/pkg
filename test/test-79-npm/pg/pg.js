'use strict';

var pg = require('pg');
if (pg.connect) {
  console.log('ok');
}
