'use strict';

let pg = require('pg.js');
if (pg.connect) {
  console.log('ok');
}
