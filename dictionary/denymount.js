'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'lib/index.js': [
        'require(\'macmount\')',
        'require(\'macmount\', \'can-ignore\')'
      ]
    }
  }
};
