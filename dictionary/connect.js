'use strict';

module.exports = {
  pkgConfig: {
    scripts: [
      'lib/middleware/*.js'
    ],
    assets: [
      'lib/public/**/*' // for connect@2.3
    ]
  }
};
