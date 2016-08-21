let path = require('path');
let xlsx = require('xlsx');

let xls = xlsx.readFileSync(path.join(__dirname, 'ketk.xls'));
let ods = xlsx.readFileSync(path.join(__dirname, 'ffc.ods'));

if ((xls.Strings.length > 50) &&
    (ods.SheetNames.length > 0)) {
  console.log('ok');
}
