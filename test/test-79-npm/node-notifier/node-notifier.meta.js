'use strict';

module.exports = function (stamp, flags) {
  if (stamp.p === 'win32' && flags.ci) {
    return {
      allow: false,
      note: 'headless windows CI seems to fail to show baloon'
    };
  }

  if (stamp.p === 'win32' && stamp.m < 48) {
    return {
      allow: false,
      note: 'flat npm is needed to require(\'which\')'
    };
  }

  return {
    deployFiles: [
      [ 'node_modules/node-notifier/vendor/notifu/notifu.exe', 'notifu/notifu.exe' ],
      [ 'node_modules/node-notifier/vendor/notifu/notifu64.exe', 'notifu/notifu64.exe' ],
      [ 'node_modules/node-notifier/vendor/terminal-notifier.app/Contents/MacOS/terminal-notifier', 'terminal-notifier/terminal-notifier' ],
      [ 'node_modules/node-notifier/vendor/snoreToast/SnoreToast.exe', 'snoreToast/SnoreToast.exe' ]
    ]
  };
};
