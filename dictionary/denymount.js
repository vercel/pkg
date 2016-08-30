'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'lib/index.js': [
        'require(\'macmount\')',
        'require(\'macmount\', \'may-exclude\')'
      ]
    }
  }
};
