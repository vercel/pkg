'use strict';

module.exports = function (stamp) {
  return {
    allow: !/^arm/.test(stamp.a),
    deployFilesFrom: ['phantom', 'phantomjs-prebuilt'],
  };
};
