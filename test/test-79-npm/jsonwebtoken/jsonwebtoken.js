'use strict';

var jwt = require('jsonwebtoken');
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
if (token.length > 10) {
  console.log('ok');
}
