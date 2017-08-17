'use strict';

var Nedb = require('nedb');
var db = new Nedb({ filename: 'database.db' });

db.loadDatabase(function (error) {
  if (error) throw error;
  db.insert([ { a: 5 }, { a: 42 } ], function (error2) {
    if (error2) throw error2;
    console.log('ok');
  });
});
