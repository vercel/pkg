let cookieParser = require('cookie-parser');
let req = { headers: { cookie: 'MyCookie=Hello' } };
let res = {};

let middleware = cookieParser();

middleware(req, res, function () {
  if (req.cookies) {
    if (req.cookies.MyCookie === 'Hello') {
      console.log('ok');
    }
  }
});
