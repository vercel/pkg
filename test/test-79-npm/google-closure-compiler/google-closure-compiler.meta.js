'use strict';

module.exports = function () {
  return {
    deployFiles:
      require('../../../dictionary/google-closure-compiler.js').pkg.deployFiles
  };
};
