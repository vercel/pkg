'use strict';

var drivelist = require('drivelist');
drivelist.list(function (error, list) {
  if (error) throw error;
  if (list.length > 0) {
    console.log('ok');
  }
});
