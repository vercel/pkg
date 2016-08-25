'use strict';

var Promise = require('native-or-bluebird');
if (Promise && global.Promise) {
  console.log('ok');
}
