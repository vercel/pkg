'use strict';

var yargs = require('yargs');
var argv = yargs.argv;
if (argv.$0) {
  console.log('ok');
}
