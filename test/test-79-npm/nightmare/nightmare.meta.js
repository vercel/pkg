'use strict';

module.exports = function (stamp, flags) {
  if (flags.ci) {
    return {
      allow: false,
      note: 'headless CI seems to fail headful electron',
    };
  }

  return {
    deployFilesFrom: ['electron', 'nightmare'],
  };
};
