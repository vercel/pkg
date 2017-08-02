'use strict';

module.exports = {
  pkg: {
    patches: {
      'index.js': [
        'path.join(__dirname, fs',
        'path.join(path.dirname(process.execPath), \'electron\', fs'
      ]
    },
    deployFiles: [
      [ 'dist', 'electron/dist' ]
    ]
  }
};
