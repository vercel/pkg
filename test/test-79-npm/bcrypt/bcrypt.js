'use strict';

var bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 'P4$$w0rD';
bcrypt.genSalt(saltRounds, function (error, salt) {
  if (error) return;
  bcrypt.hash(myPlaintextPassword, salt, function (error2, hash) {
    if (error2) return;
    if (typeof hash === 'string') {
      console.log('ok');
    }
  });
});
