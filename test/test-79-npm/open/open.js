'use strict';

var open = require('open');
open('package.json').then(() => {
  console.log('ok');
});
