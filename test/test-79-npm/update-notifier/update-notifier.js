'use strict';

// anyway testing in ci
require('ci-info').isCI = false;

var spawnWasCalled;
var save = require('child_process').spawn;
require('child_process').spawn = function () {
  spawnWasCalled = true;
  return save.apply(this, arguments); // eslint-disable-line prefer-rest-params
};

var updateNotifier = require('update-notifier');
var pjson = { name: 'pkg', version: '3.0.0' };
var notifier;

function runNotifier() {
  notifier = updateNotifier({
    pkg: pjson,
    updateCheckInterval: 0,
  });
  setTimeout(function () {
    if (
      spawnWasCalled &&
      notifier.update &&
      notifier.update.current === '3.0.0'
    ) {
      console.log('ok');
      process.exit(0);
    } else {
      runNotifier();
    }
  }, 1984);
}

runNotifier();
