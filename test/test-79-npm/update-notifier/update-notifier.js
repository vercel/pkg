'use strict';

var updateNotifier = require('update-notifier');
var pjson = { name: 'pkg', version: '3.0.0' };
var notifier = updateNotifier({ pkg: pjson, updateCheckInterval: 1000 });

setInterval(function () {
  if (notifier.update && notifier.update.current === '3.0.0') {
    console.log('ok');
    process.exit(0);
  }
}, 450);
