'use strict';

let override = require('method-override');
let req = { method: 'GET', headers: { } };
let res = {};

let middleware = override();

middleware(req, res, function () {
  if (req.originalMethod === 'GET') {
    console.log('ok');
  }
});
