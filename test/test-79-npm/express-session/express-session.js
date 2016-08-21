'use strict';

let session = require('express-session');
let req = { url: '/', headers: { } };
let res = {};

function genuuid () {
  return 'SESSIONID';
}

let middleware = session({
  genid: function () {
    return genuuid();
  },
  resave: false,
  saveUninitialized: false,
  secret: 'keyboard cat'
});

middleware(req, res, function () {
  if (req.sessionID === 'SESSIONID') {
    console.log('ok');
  }
});
