'use strict';

let Server = require('mongodb-core').Server;
if (typeof Server === 'function') {
  console.log('ok');
}
