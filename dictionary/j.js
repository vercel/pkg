'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'j.js': [
        'require(\'xl\'+\'sx\')',
        'require(\'xlsx\')',
        'require(\'xl\'+\'sjs\')',
        'require(\'xlsjs\')',
        'require(\'ha\'+\'rb\')',
        'require(\'harb\')'
      ]
    }
  }
};
