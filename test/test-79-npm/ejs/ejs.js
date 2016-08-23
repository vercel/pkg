'use strict';

let ejs = require('ejs');

let s = '<% if (user) { %>' +
        '<h2><%= user.name %></h2>' +
        '<% } %>';

let template = ejs.compile(s, { client: true });
let out = template({ user: { name: 'klopov' } });
if (out === '<h2>klopov</h2>') {
  console.log('ok');
}
