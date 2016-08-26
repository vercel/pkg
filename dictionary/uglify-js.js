'use strict';

module.exports = {
  pkgConfig: {
    // assets, not scripts because of custom
    // load_global (readFileSync + runInContext)
    assets: [
      'lib/**/*.js',
      'tools/*.js'
    ]
  }
};
