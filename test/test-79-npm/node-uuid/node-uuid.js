'use strict';

var uuid = require('node-uuid');
if (uuid.v1().length === 36) {
  console.log('ok');
}
