'use strict';

var cookieParser = require('cookie-parser');
var req = { headers: { cookie: 'MyCookie=Hello' } };
var res = {};

var middleware = cookieParser();

middleware(req, res, function () {
  if (req.cookies) {
    if (req.cookies.MyCookie === 'Hello') {
      console.log('ok');
    }
  }
});
