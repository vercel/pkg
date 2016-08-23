'use strict';

// dont remove --help
process.argv.push('--help');
require('browserify/bin/cmd.js');

setTimeout(function () {
  console.log('ok');
}, 200);
