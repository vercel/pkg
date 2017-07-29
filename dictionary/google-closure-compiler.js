'use strict';

module.exports = {
  pkg: {
    assets: [
      'compiler.jar'
    ],
    patches: {
      'lib/node/closure-compiler.js': [
        'require.resolve(\'../../compiler.jar\')',
        'require(\'path\').join(require(\'path\').dirname(process.execPath), \'compiler.jar\')'
      ]
    }
  }
};
