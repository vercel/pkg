'use strict';

// FOR NODE-NOTIFIER USERS:
// place 'vendor' directory from 'node_modules/node-notifier'
// to the directory where final executable is deployed

module.exports = {
  pkg: {
    patches: {
      'notifiers/balloon.js': [
        '__dirname,',
        'process.execPath + \'/\','
      ],
      'notifiers/notificationcenter.js': [
        '__dirname,',
        'process.execPath + \'/\','
      ],
      'notifiers/toaster.js': [
        '__dirname,',
        'process.execPath + \'/\','
      ]
    }
  }
};
