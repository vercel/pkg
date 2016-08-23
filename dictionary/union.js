'use strict';

module.exports = {

  patches: {

    'lib/core.js': [
      'require(\'spdy\')',
      'require(\'spdy\', \'can-ignore\')'
    ]

  }

};
