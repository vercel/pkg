'use strict';

var cookie = require('cookie');
var cookies = cookie.parse('foo=bar; equation=E%3Dmc%5E2');
if (cookies.equation === 'E=mc^2') {
  console.log('ok');
}
