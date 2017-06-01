'use strict';

module.exports = {
  pkg: {
    patches: {
      'index.js': [
        'spawn(process.execPath, [path.join(__dirname, \'check.js\')',
        'spawn(process.execPath, [\'--entrypoint\', path.join(__dirname, \'check.js\')'
      ]
    }
  }
};
