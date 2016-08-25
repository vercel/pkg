'use strict';

var ncp = require('copy-paste');
ncp.copy('hello from enclose', function () {
  console.log('ok');
});
