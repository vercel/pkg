'use strict';

setTimeout(function () {
  console.log('ok');
  process.kill(process.pid, 'SIGUSR1');
}, 3000);
