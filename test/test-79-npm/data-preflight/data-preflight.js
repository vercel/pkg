'use strict';

let path = require('path');
let PreflightFile = require('data-preflight/src/js/preflightFile.js');
let rimraf = require('../../../node_modules/rimraf');
let output = 'Sample_4_col.csv_preflight.html';

let preflight = new PreflightFile(
  path.join(__dirname, 'Sample_4_col.csv'),
  output, 'html', false
);

preflight.init(function (error) {
  if (error) throw error;
  rimraf.sync(output);
  console.log('ok');
});
