'use strict';

module.exports = {

  scripts: [
    'lib/**/*.js'
  ],

  patches: {

    'lib/native/index.js': [
      'require(\'pg-native\')',
      'require(\'pg-native\', \'can-ignore\')'
    ]

  }

};
