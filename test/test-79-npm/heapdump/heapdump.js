'use strict';

var fs = require('fs');
var heapdump = require('heapdump');
var name = './heapdump.heapsnapshot';
heapdump.writeSnapshot(name, function (error1, filename) {
  if (error1) throw error1;
  fs.unlink(filename, function (error2) {
    if (error2) throw error2;
    console.log('ok');
  });
});
