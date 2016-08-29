'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'voc.js': [
        'require(\'coffee-script\')',
        'require(\'coffee-script\', \'can-ignore\')'
      ]
    }
  }
};
