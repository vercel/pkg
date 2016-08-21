let connect = require('connect');
let noop = function () {};
let req = { headers: { }, url: '/', originalUrl: '/' };
let res = { setHeader: noop, end: function (s) {
  if (s.length > 100) {
    console.log('ok');
    process.exit();
  }
} };

let middleware = connect.directory.html;

middleware(req, res, [ 'file-name' ], function () {
  console.log('Error not expected');
}, 'directory-name');
