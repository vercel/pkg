'use strict';

let usage = require('usage');
let pid = process.pid;
usage.lookup(pid, function (error, result) {
  if (result.memory) {
    console.log('ok');
  }
});
