'use strict';

var sass = require('node-sass');
var data = '#hello {\n  color: #08c; }\n';
const result = sass.renderSync({ data: data }).css.toString();
if (result === data) {
  console.log('ok');
}
