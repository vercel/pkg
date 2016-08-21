let QueryStream = require('pg-query-stream');
let query = new QueryStream('SELECT * FROM generate_series(0, $1) num', [ 1000000 ]);
if (query.state) {
  console.log('ok');
}
