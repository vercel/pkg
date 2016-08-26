'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'lib/utils.js': [
        'process.cwd()',
        'require(\'path\').dirname(require.main.filename)'
      ]
    }
  }
};
