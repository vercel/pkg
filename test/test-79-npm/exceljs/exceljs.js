'use strict';

var Excel = require('exceljs');
var workbook = new Excel.Workbook();
if (workbook.created) {
  console.log('ok');
}
