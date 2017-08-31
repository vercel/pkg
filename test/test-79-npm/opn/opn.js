'use strict';

var opn = require('opn');
opn('https://github.com/zeit/pkg').then(() => {
  console.log('ok');
});
