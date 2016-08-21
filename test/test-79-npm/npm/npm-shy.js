'use strict';

console.log = function () {
  process.stdout.write('ok\n');
};

process.argv.push('version');
require('npm/bin/npm-cli.js');
