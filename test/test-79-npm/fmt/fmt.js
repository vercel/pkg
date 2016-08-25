'use strict';

var fmt = require('fmt');

var save;
console.log = function (s) {
  save = s;
};

fmt.sep();

if (save.slice(0, 3) === '===') {
  process.stdout.write('ok\n');
}
