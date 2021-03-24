'use strict';

var Cursor = require('pg-cursor');
var cursor = new Cursor('SELECT * FROM some_table WHERE prop > $1', [100]);
if (cursor.state) {
  console.log('ok');
}
