'use strict';

var ncp = require('copy-paste');
ncp.copy('hello from pkg', function () {
  console.log('ok');
});
