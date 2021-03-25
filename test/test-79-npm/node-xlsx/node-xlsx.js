'use strict';

var path = require('path');
var xlsx = require('node-xlsx');

var xls = xlsx.parse(path.join(__dirname, 'registry.xls'));
var ods = xlsx.parse(path.join(__dirname, 'ffc.ods'));

var data = [
  [1, 2, 3],
  [true, false, null, 'sheetjs'],
  ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'],
  ['baz', null, 'qux'],
];

var buffer = xlsx.build([{ name: 'SheetName', data: data }]);

if (xls[0].data.length > 50 && ods[0].data.length > 30 && buffer.length > 10) {
  console.log('ok');
}
