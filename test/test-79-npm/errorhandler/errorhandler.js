let errorhandler = require('errorhandler');
let noop = function () {};
let req = { headers: { Accept: 'text/html' } };
let res = { setHeader: noop, end: noop };

let middleware = errorhandler();
let wasCalled = false;

middleware('Message', req, res, function () {
  wasCalled = true;
});

setTimeout(function () {
  if (!wasCalled) console.log('ok');
}, 200);
