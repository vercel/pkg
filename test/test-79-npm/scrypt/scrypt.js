'use strict';

let scrypt = require('scrypt');
if (scrypt.hashSync) {
  console.log('ok');
}
