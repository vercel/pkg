let cors = require('cors');
let req = { method: 'OPTIONS', headers: { } };
let res = { headers: {}, setHeader: function (name, value) {
  this.headers[name] = value;
}, end: function () {
  if (res.headers['Access-Control-Allow-Origin'] === '*') {
    console.log('ok');
  }
} };

let middleware = cors();
middleware(req, res);
