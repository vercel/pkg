'use strict';

module.exports = function (stamp, flags) {
  if (flags.ci) {
    return {
      allow: false,
      note: 'headless CI seems to fail headful chromium',
    };
  }

  return {
    deployFilesFrom: ['puppeteer'],
  };
};
