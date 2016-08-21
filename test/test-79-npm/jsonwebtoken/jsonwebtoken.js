let jwt = require('jsonwebtoken');
let token = jwt.sign({ foo: 'bar' }, 'shhhhh');
if (token.length > 10) {
  console.log('ok');
}
