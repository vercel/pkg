'use strict';

var fs = require('fs');
var path = require('path');
var name = path.join(__dirname, 'not' + 'exists'); // eslint-disable-line no-useless-concat

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
