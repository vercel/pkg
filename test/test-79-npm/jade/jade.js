// see also express.js

let file =
'html\n' +
'  head\n' +
'    title!= title\n' +
'  body\n' +
'    h1!= message\n';

let jade = require('jade');
let fn = jade.compile(file, {});
let html = fn({ title: 'Hey', message: 'Hello there!' });

if (html === '<html><head><title>Hey</title></head>' +
                   '<body><h1>Hello there!</h1></body></html>') {
  console.log('ok');
}
