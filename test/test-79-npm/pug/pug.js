'use strict';

// see also express.js

var file =
  'html\n' +
  '  head\n' +
  '    title!= title\n' +
  '  body\n' +
  '    h1!= message\n';

var pug = require('pug');
var fn = pug.compile(file, {});
var html = fn({ title: 'Hey', message: 'Hello there!' });

if (
  html ===
  '<html><head><title>Hey</title></head>' +
    '<body><h1>Hello there!</h1></body></html>'
) {
  console.log('ok');
}
