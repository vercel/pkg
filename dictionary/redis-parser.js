'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'lib/hiredis.js': [
        'require(\'hiredis\')',
        'require(\'hiredis\', \'can-ignore\')'
      ]
    }
  }
};
