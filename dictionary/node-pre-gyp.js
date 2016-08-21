'use strict';

module.exports = {

  scripts: [
    'lib/*.js'
  ],

  patches: {

    'lib/*.js': [
      'require("aws-sdk")',
      'require("aws-sdk", "can-ignore")'
    ]

  }

};
