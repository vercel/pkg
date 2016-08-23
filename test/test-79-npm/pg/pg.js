'use strict';

let pg = require('pg');
if (pg.connect) {
  console.log('ok');
}
