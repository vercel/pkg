'use strict';

module.exports = {

  patches: {

    'index.js': [
      'execFile(process.execPath, [\'--v8-options\'],',
      'execFile(process.execPath, [\'--entrypoint\', \'-\', \'--runtime\', \'--v8-options\'],'
    ]

  }

};
