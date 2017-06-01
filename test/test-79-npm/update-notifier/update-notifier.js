'use strict';

var spawnWasCalled;
var save = require('child_process').spawn;
require('child_process').spawn = function () {
  spawnWasCalled = true;
  return save.apply(this, arguments); // eslint-disable-line prefer-rest-params
};

var updateNotifier = require('update-notifier');
var pjson = { name: 'pkg', version: '3.0.0' };
var notifier;

function runNotifier (cb) {
  notifier = updateNotifier({
    pkg: pjson,
    updateCheckInterval: 0
  });
  setTimeout(function () {
    cb(notifier.update);
  }, 950);
}

// never works first time.
// it seems to create some
// persistent structures

runNotifier(function () {
  runNotifier(function (update) {
    if (spawnWasCalled &&
        update &&
        update.current === '3.0.0') {
      console.log('ok');
    }
    process.exit(0);
  });
});
