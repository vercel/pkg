'use strict';

module.exports = {
  pkg: {
    scripts: [
      'lib/*.js'
    ],
    patches: {
      'lib/help.js': [
        'path.dirname(__dirname)',
        'path.dirname(process.argv[1])'
      ]
    }
  }
};
