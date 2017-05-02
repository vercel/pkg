'use strict';

var Leveldown = require('leveldown');
var db = new Leveldown('dbname');
var rimraf = require('../../../node_modules/rimraf');

(function (cb) {
  db.open(function (error1) {
    if (error1) return cb(error1);

    db.put('dave@gmail.com', JSON.stringify({
      _id: 'dave@gmail.com',
      name: 'David',
      age: 68
    }), function (error2) {
      if (error2) return cb(error2);
      db.get('dave@gmail.com', function (error3, data) {
        if (error3) return cb(error3);
        data = JSON.parse(data.toString());
        if (data.age === 68) {
          console.log('ok');
          return cb();
        }
      });
    });
  });
}(function (error) {
  if (error) throw error;
  db.close(function () {
    rimraf.sync('dbname');
  });
}));
