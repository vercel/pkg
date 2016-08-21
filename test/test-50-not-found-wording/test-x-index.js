/* eslint-disable no-useless-concat */

'use strict';

let fs = require('fs');
let path = require('path');
let name = path.join(__dirname, 'not' + 'exists');

try {
  fs.readFileSync(name);
} catch (e) {
  console.log(e.message);
}

console.log('*****');

try {
  require('not-exists');
} catch (e) {
  console.log(e.message);
}
