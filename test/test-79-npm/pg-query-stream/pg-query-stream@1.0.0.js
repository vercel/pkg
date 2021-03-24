'use strict';

var QueryStream = require('pg-query-stream');
var query = new QueryStream('SELECT * FROM generate_series(0, $1) num', [
  1000000,
]);
if (query.state || (query.cursor && query.cursor.state)) {
  console.log('ok');
}
