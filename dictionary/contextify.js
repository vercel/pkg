'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'lib/contextify.js': [
        'require(\'bindings\')(\'contextify\')',
        'require(\'bindings\')({ bindings: \'contextify\', module_root: __dirname + \'/..\' })'
      ]
    }
  }
};
