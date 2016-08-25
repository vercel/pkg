'use strict';

var MongoStore = require('connect-mongodb');
if (typeof MongoStore === 'function') {
  console.log('ok');
}
