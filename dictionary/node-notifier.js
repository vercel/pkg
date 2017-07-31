'use strict';

// FOR NODE-NOTIFIER USERS:
// place 'vendor' directory from 'node_modules/node-notifier'
// to the directory where final executable is deployed

module.exports = {
  pkg: {
    patches: {
      'notifiers/balloon.js': [
        '__dirname, \'../vendor/notifu/notifu\'',
        'path.dirname(process.execPath), \'notifier/notifu\''
      ],
      'notifiers/notificationcenter.js': [
        '__dirname,\n  \'../vendor/terminal-notifier.app/Contents/MacOS/terminal-notifier\'',
        'path.dirname(process.execPath), \'notifier/terminal-notifier\''
      ],
      'notifiers/toaster.js': [
        '__dirname, \'../vendor/snoreToast/SnoreToast.exe\'',
        'path.dirname(process.execPath), \'notifier/SnoreToast.exe\''
      ]
    },
    deployFiles: [
      [ 'vendor/notifu/notifu.exe', 'notifier/notifu.exe' ],
      [ 'vendor/notifu/notifu64.exe', 'notifier/notifu64.exe' ],
      [ 'vendor/terminal-notifier.app/Contents/MacOS/terminal-notifier', 'notifier/terminal-notifier' ],
      [ 'vendor/snoreToast/SnoreToast.exe', 'notifier/SnoreToast.exe' ]
    ]
  }
};
