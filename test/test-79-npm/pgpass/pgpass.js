'use strict';

var pgpass = require('pgpass');

var connection = {
  host: 'pgserver',
  user: 'the_user_name',
};

pgpass(connection, function () {
  console.log('ok');
});
