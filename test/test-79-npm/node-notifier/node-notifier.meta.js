'use strict';

module.exports = function (stamp, flags) {
  if (stamp.p === 'win32' && flags.ci) {
    return {
      allow: false,
      note: 'headless windows CI seems to fail to show baloon',
    };
  }

  if (stamp.p === 'win32' && stamp.m < 48) {
    return {
      allow: false,
      note: "flat npm is needed to require('which')",
    };
  }

  return {
    deployFilesFrom: ['node-notifier'],
  };
};
