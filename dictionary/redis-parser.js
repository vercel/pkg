'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'lib/hiredis.js': [
        'require(\'hiredis\')',
        'require(\'hiredis\', \'may-exclude\')'
      ]
    }
  }
};
