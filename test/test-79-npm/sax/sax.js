'use strict';

let sax = require('sax');
let parser = sax.parser(true);

parser.onopentag = function (node) {
  if (node.name === 'hello') {
    console.log('ok');
  }
};

parser.write('<hello>World!</hello>').close();
