'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/node/closure-compiler.js': [
        'require.resolve(\'../../compiler.jar\')',
        'require(\'path\').join(require(\'path\').dirname(process.execPath), \'compiler.jar\')'
      ]
    },
    deployFiles: [
      [ 'node_modules/google-closure-compiler/compiler.jar', 'compiler.jar' ]
    ]
  }
};
