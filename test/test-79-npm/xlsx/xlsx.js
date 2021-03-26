'use strict';

var path = require('path');
var xlsx = require('xlsx');

var xls = xlsx.readFileSync(path.join(__dirname, 'registry.xls'));
var ods = xlsx.readFileSync(path.join(__dirname, 'ffc.ods'));

if (xls.Strings.length > 50 && ods.SheetNames.length > 0) {
  console.log('ok');
}
