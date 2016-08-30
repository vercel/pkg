'use strict';

module.exports = {
  pkgConfig: {
    scripts: [
      'lib/**/*.js'
    ],
    patches: {
      'lib/native/index.js': [
        'require(\'pg-native\')',
        'require(\'pg-native\', \'may-exclude\')'
      ]
    }
  }
};
