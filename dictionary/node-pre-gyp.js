'use strict';

module.exports = {
  pkgConfig: {
    scripts: [
      'lib/*.js'
    ],
    patches: {
      'lib/info.js': [
        'require("aws-sdk")',
        'require("aws-sdk", "can-ignore")'
      ],
      'lib/publish.js': [
        'require("aws-sdk")',
        'require("aws-sdk", "can-ignore")'
      ],
      'lib/unpublish.js': [
        'require("aws-sdk")',
        'require("aws-sdk", "can-ignore")'
      ]
    }
  }
};
