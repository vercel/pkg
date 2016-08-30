'use strict';

var j = require('j');
var path = require('path');
var xls = j.readFile(path.join(__dirname, 'registry.xls'));
if (xls[1].Strings.length > 50) {
  console.log('ok');
}
