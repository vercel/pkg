'use strict';

var ejs = require('ejs');

var s = '<% if (user) { %><h2><%= user.name %></h2><% } %>';

var template = ejs.compile(s, { client: true });
var out = template({ user: { name: 'klopov' } });
if (out === '<h2>klopov</h2>') {
  console.log('ok');
}
