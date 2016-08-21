let compression = require('compression');
let req = { headers: { } };
let res = {};

let middleware = compression();

middleware(req, res, function () {
  console.log('ok');
});
