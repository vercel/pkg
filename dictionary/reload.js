'use strict';

module.exports = {
  pkg: {
    patches: {
      'bin/reload': [
        'path.join(__dirname, \'../lib/reload-server.js\')',
        'require.resolve(\'../lib/reload-server.js\')'
      ]
    }
  }
};
