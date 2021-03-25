'use strict';

var parser = require('body-parser');
var req = { headers: {} };
var res = {};

var middleware = parser.json();

middleware(req, res, function () {
  var middleware2 = parser.urlencoded({ extended: true });
  middleware2(req, res, function () {
    var middleware3 = parser.urlencoded({ extended: false });
    middleware3(req, res, function () {
      console.log('ok');
    });
  });
});
