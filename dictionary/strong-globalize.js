'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/translate.js': [
        'path.join(__dirname, \'local-credentials.json\')',
        'require.resolve(\'./local-credentials.json\')'
      ]
    }
  }
};
