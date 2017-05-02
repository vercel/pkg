'use strict';

var PouchDB = require('pouchdb');
var db = new PouchDB('dbname');
var rimraf = require('../../../node_modules/rimraf');

(function (cb) {
  db.put({
    _id: 'dave@gmail.com',
    name: 'David',
    age: 68
  }, function (error1) {
    if (error1) return cb(error1);
    db.get('dave@gmail.com', function (error2, data) {
      if (error2) return cb(error2);
      if (data.age === 68) {
        console.log('ok');
        return cb();
      }
    });
  });
}(function (error) {
  if (error) throw error;
  db.close(function () {
    rimraf.sync('dbname');
  });
}));
