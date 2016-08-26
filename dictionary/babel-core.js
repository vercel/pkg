'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'lib/babel/util.js': [
        'path.join(__dirname, "transformation/templates")',
        'path.join(__dirname, "transformation/templates", "")'
      ]
    }
  }
};
