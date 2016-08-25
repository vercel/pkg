'use strict';

var optimist = require('optimist');
var argv = optimist.argv;
if (argv.$0) {
  console.log('ok');
}
