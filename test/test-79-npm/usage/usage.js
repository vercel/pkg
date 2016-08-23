'use strict';

let usage = require('usage');
let pid = process.pid;
usage.lookup(pid, function (error, result) {
  if (error) throw error;
  if (result.memory) console.log('ok');
});
