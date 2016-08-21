let Cursor = require('pg-cursor');
let cursor = new Cursor('SELECT * FROM some_table WHERE prop > $1', [ 100 ]);
if (cursor.state) {
  console.log('ok');
}
