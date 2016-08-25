'use strict';

var forge = require('node-forge');
if (typeof forge.tls.createConnection === 'function') {
  console.log('ok');
}
