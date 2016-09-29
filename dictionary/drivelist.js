'use strict';

module.exports = {
  pkg: {
    assets: [
      'scripts/*'
    ],
    patches: {
      'build/scripts.js': [
        'path.join(__dirname, \'..\', \'scripts\')',
        'path.join(path.dirname(process.execPath), \'scripts\')'
      ]
    }
  }
};
