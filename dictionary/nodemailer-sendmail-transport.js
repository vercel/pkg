'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'src/sendmail-transport.js': [
        'require(\'readable-stream\')',
        'require(\'readable-stream\', \'can-ignore\')'
      ]
    }
  }
};
