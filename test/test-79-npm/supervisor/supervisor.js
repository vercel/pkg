'use strict';

var supervisor = require('supervisor');
var program = require.resolve('./fixture.js');
var args = ['-n', 'success', program];
supervisor.run(args);
setTimeout(function () {
  process.exit();
}, 500);
