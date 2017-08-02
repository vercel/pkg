'use strict';

module.exports = function (stamp, flags) {
  if (stamp.p === 'win32' && flags.ci) {
    return {
      allow: false,
      note: 'windows CI seems to hang'
    };
  }

  return {
    deployFilesFrom: [ 'electron', 'nightmare' ]
  };
};
