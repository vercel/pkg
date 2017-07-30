'use strict';

module.exports = function (stamp) {
  return {
    allow: (!(/^arm/).test(stamp.a)),
    deployFiles: [
      [ 'node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs', 'phantomjs' ]
    ]
  };
};
