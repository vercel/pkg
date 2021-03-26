'use strict';

var Nedb = require('nedb');
var fs = require('fs');
var filename = 'database.db';
var db = new Nedb({ filename: filename });

db.loadDatabase(function (error) {
  if (error) throw error;
  db.insert([{ a: 5 }, { a: 42 }], function (error2) {
    if (error2) throw error2;
    fs.unlinkSync(filename);
    console.log('ok');
  });
});
