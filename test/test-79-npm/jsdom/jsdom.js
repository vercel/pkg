'use strict';

var jsdom = require('jsdom');

jsdom.env(
  '<p><a class="the-link" href="https://github.com/tmpvar/jsdom">jsdom!</a></p>',
  function (errors, window) {
    if (window.document.body.children[0].tagName === 'P') {
      console.log('ok');
    }
  }
);
