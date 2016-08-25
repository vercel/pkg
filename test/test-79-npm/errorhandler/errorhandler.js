'use strict';

var errorhandler = require('errorhandler');
var noop = function () {};
var req = { headers: { Accept: 'text/html' } };
var res = { setHeader: noop, end: noop };

var middleware = errorhandler();
var wasCalled = false;

middleware('Message', req, res, function () {
  wasCalled = true;
});

setTimeout(function () {
  if (!wasCalled) console.log('ok');
}, 200);
