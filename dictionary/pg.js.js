'use strict';

module.exports = {

  scripts: [
    'lib/**/*.js'
  ],

  patches: {

    'lib/native/index.js': [
      'require(\'pg-native\')',
      'require(\'pg-native\', \'can-ignore\')',
      'require(\'semver\')',
      'require(\'semver\', \'can-ignore\')',
      'require(\'bindings\')',
      'require(\'bindings\', \'can-ignore\')' // for 3.6.2
    ]

  }

};
