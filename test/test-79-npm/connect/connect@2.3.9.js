'use strict';

var connect = require('connect');
var noop = function () {};
var req = { headers: { }, url: '/', originalUrl: '/' };
var res = { setHeader: noop, end: function (s) {
  if (s.length > 100) {
    console.log('ok');
    process.exit();
  }
} };

var middleware = connect.directory.html;

middleware(req, res, [ 'file-name' ], function () {
  console.log('Error not expected');
}, 'directory-name');
