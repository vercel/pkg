'use strict';

let path = require('path');
let xlsx = require('node-xlsx');

let xls = xlsx.parse(path.join(__dirname, 'ketk.xls'));
let ods = xlsx.parse(path.join(__dirname, 'ffc.ods'));

let data = [
  [ 1, 2, 3 ],
  [ true, false, null, 'sheetjs' ],
  [ 'foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3' ],
  [ 'baz', null, 'qux' ]
];

let buffer = xlsx.build([ { name: 'SheetName', data: data } ]);

if ((xls[0].data.length > 50) &&
    (ods[0].data.length > 30) &&
    (buffer.length > 10)) {
  console.log('ok');
}
