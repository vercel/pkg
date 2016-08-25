'use strict';

var throng = require('throng');

throng(8, function (id) {
  if (id === 7) {
    console.log('ok');
  }
});

setTimeout(function () {
  process.exit();
}, 5000);
