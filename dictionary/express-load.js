'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'lib/express-load.js': [
        'entity = path.resolve(',
        'entity = process.enclose.path.resolve('
      ]
    }
  }
};
