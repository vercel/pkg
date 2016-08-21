#!/usr/bin/env node

setTimeout(function () {
  console.log('ok');
  process.kill(process.pid, 'SIGUSR1');
}, 3000);
