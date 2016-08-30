'use strict';

module.exports = {
  pkgConfig: {
    scripts: [
      'lib/*.js'
    ],
    patches: {
      'lib/info.js': [
        'require("aws-sdk")',
        'require("aws-sdk", "may-exclude")'
      ],
      'lib/publish.js': [
        'require("aws-sdk")',
        'require("aws-sdk", "may-exclude")'
      ],
      'lib/unpublish.js': [
        'require("aws-sdk")',
        'require("aws-sdk", "may-exclude")'
      ]
    }
  }
};
