'use strict';

var usage = require('usage');
var pid = process.pid;
usage.lookup(pid, function (error, result) {
  if (error) throw error;
  if (result.memory) console.log('ok');
});
