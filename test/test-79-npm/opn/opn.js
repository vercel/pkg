'use strict';

var opn = require('opn');
opn('package.json').then(() => {
  console.log('ok');
});
