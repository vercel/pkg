'use strict';

module.exports = {

  patches: {

    'lib/index.js': [
      'require(\'macmount\')',
      'require(\'macmount\', \'can-ignore\')'
    ]

  }

};
