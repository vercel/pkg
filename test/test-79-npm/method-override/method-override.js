'use strict';

var override = require('method-override');
var req = { method: 'GET', headers: {} };
var res = {};

var middleware = override();

middleware(req, res, function () {
  if (req.originalMethod === 'GET') {
    console.log('ok');
  }
});
