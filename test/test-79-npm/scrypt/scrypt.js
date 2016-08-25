'use strict';

var scrypt = require('scrypt');
if (scrypt.hashSync) {
  console.log('ok');
}
