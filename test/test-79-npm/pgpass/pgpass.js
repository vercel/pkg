'use strict';

let pgpass = require('pgpass');

let connection = {
  'host': 'pgserver',
  'user': 'the_user_name'
};

pgpass(connection, function () {
  console.log('ok');
});
