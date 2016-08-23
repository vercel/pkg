'use strict';

module.exports = {

  patches: {

    'lib/win32.js': [
      'require(\'diskpart\')',
      'require(\'diskpart\', \'can-ignore\')'
    ]

  }

};
