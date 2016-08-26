'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'xlsx.js': [
        'require(\'js\'+\'zip\')',
        'require(\'jszip\')',
        'require(\'./od\' + \'s\')',
        'require(\'./ods\')'
      ]
    }
  }
};
