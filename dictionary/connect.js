'use strict';

module.exports = {
  pkgConfig: {
    scripts: [
      'lib/middleware/*.js'
    ],
    assets: [
      'lib/public/**/*' // for connect@2.3
    ],
    patches: {
      'index.js': [
        'require(\'./lib-cov/connect\')',
        'require(\'./lib-cov/connect\', \'may-exclude\')' // for connect@2.3
      ],
      'lib/middleware/compiler.js': [
        'require(\'sass\')',
        'require(\'sass\', \'may-exclude\')',
        'require(\'less\')',
        'require(\'less\', \'may-exclude\')',
        'require(\'coffee-script\')',
        'require(\'coffee-script\', \'may-exclude\')'
      ]
    }
  }
};
