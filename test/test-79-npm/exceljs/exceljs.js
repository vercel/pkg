'use strict';

let Excel = require('exceljs');
let workbook = new Excel.Workbook();
if (workbook.created) {
  console.log('ok');
}
