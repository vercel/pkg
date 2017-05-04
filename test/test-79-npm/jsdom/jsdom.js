'use strict';

var JSDOM = require('jsdom').JSDOM;
var dom = new JSDOM('<p><a class="the-link" href="https://github.com/tmpvar/jsdom">jsdom!</a></p>');
var window = dom.window;
if (window.document.body.children[0].tagName === 'P') {
  console.log('ok');
}
