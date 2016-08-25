'use strict';

var CronJob = require('cron').CronJob;

var counter = 0;

new CronJob('* * * * * *', function () { // eslint-disable-line no-new
  counter += 1;
}, null, true, 'America/Los_Angeles');

setTimeout(function () {
  if (counter === 4) console.log('ok');
  process.exit();
}, 4500);
