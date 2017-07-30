'use strict';

module.exports = function (stamp) {
  return {
    allow: (!(/^arm/).test(stamp.a)),
    deployFiles:
      require('../../../dictionary/phantomjs-prebuilt.js').pkg.deployFiles
  };
};
