'use strict';

module.exports = {
  pkgConfig: {
    scripts: [
      'lib/**/*.js'
    ],
    patches: {
      'lib/native/index.js': [
        'require(\'pg-native\')',
        'require(\'pg-native\', \'may-exclude\')',
        'require(\'semver\')',
        'require(\'semver\', \'may-exclude\')',
        'require(\'bindings\')',
        'require(\'bindings\', \'may-exclude\')' // for 3.6.2
      ]
    }
  }
};
