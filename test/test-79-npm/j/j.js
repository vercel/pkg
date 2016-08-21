'use strict';

let j = require('j');
let path = require('path');
let xls = j.readFile(path.join(__dirname, 'ketk.xls'));
if (xls[1].Strings.length > 50) {
  console.log('ok');
}
