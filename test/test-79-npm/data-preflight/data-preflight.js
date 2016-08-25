'use strict';

var path = require('path');
var PreflightFile = require('data-preflight/src/js/preflightFile.js');
var rimraf = require('../../../node_modules/rimraf');
var output = 'Sample_4_col.csv_preflight.html';

var preflight = new PreflightFile(
  path.join(__dirname, 'Sample_4_col.csv'),
  output, 'html', false
);

preflight.init(function (error) {
  if (error) throw error;
  rimraf.sync(output);
  console.log('ok');
});
