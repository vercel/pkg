'use strict';

module.exports = {
  pkg: {
    patches: {
      'src/cache.js': [
        'path.join(__dirname, \'../.completions/cache.json\')',
        'path.join(__dirname, \'../.completions/cache.json\', \'\')'
      ]
    }
  }
};
