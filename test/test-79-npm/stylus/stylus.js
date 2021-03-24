'use strict';

var path = require('path');
var stylus = require('stylus');
var s = '@require "external.css"';
var opts = { filename: 'index.css', paths: [__dirname] };
var dep = stylus(s, opts).deps()[0];
if (path.basename(dep) === 'external.css') {
  stylus.render(s, opts, function (error, css) {
    if (error) return;
    if (css === '@import "external.css";\n') {
      console.log('ok');
    }
  });
}
