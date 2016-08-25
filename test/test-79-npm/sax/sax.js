'use strict';

var sax = require('sax');
var parser = sax.parser(true);

parser.onopentag = function (node) {
  if (node.name === 'hello') {
    console.log('ok');
  }
};

parser.write('<hello>World!</hello>').close();
