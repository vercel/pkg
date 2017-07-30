'use strict';

module.exports = function (stamp) {
  return {
    allow: (!(/^arm/).test(stamp.a)),
    deployFiles: Array.prototype.concat(
      require('../../../dictionary/phantom.js').pkg.deployFiles,
      require('../../../dictionary/phantomjs-prebuilt.js').pkg.deployFiles
    )
  };
};
