'use strict';

module.exports = function (stamp, flags) {
  if (stamp.p === 'win32' && flags.ci) {
    return {
      allow: false,
      note: 'headless windows CI seems to fail',
    };
  }

  return {
    deployFilesFrom: ['open'],
  };
};
