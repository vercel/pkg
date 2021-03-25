'use strict';

var Batch = require('batch');
var batch = new Batch();

batch.concurrency(4);

var ids = [4, 7, 12, 25];

ids.forEach(function () {
  batch.push(function (done) {
    setTimeout(function () {
      done();
    }, 100);
  });
});

var passed = 0;

batch.on('progress', function () {
  passed += 1;
});

batch.end(function (error) {
  if (error) {
    throw error;
  }
  if (passed > 3) {
    console.log('ok');
  }
});
