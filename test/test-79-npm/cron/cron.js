'use strict';

var CronJob = require('cron').CronJob;

var counter = 0;

new CronJob( // eslint-disable-line no-new
  '* * * * * *',
  function () {
    counter += 1;
  },
  null,
  true,
  'America/Los_Angeles'
);

setTimeout(function () {
  if (counter === 4) console.log('ok');
  process.exit();
}, 4500);
