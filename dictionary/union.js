'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'lib/core.js': [
        'require(\'spdy\')',
        'require(\'spdy\', \'may-exclude\')'
      ]
    }
  }
};
