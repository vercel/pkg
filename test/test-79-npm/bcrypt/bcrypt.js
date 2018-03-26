'use strict';

var bcrypt = require('bcrypt');
var saltRounds = 10;
var myPlaintextPassword = 'P4$$w0rD';
bcrypt.genSalt(saltRounds, function (error, salt) {
  if (error) return;
  bcrypt.hash(myPlaintextPassword, salt, function (error2, hash) {
    if (error2) return;
    if (typeof hash === 'string') {
      console.log('ok');
    }
  });
});
