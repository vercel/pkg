'use strict';

var session = require('express-session');
var req = { url: '/', headers: {} };
var res = {};

function genuuid() {
  return 'SESSIONID';
}

var middleware = session({
  genid: function () {
    return genuuid();
  },
  resave: false,
  saveUninitialized: false,
  secret: 'keyboard cat',
});

middleware(req, res, function () {
  if (req.sessionID === 'SESSIONID') {
    console.log('ok');
  }
});
