'use strict';

var compression = require('compression');
var req = { headers: {} };
var res = {};

var middleware = compression();

middleware(req, res, function () {
  console.log('ok');
});
