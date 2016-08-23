'use strict';

module.exports = {

  patches: {

    'lib/utils.js': [
      'process.cwd()',
      'require(\'path\').dirname(require.main.filename)'
    ]

  }

};
