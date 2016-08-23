'use strict';

module.exports = {

  patches: {

    'src/sendmail-transport.js': [
      'require(\'readable-stream\')',
      'require(\'readable-stream\', \'can-ignore\')'
    ]

  }

};
