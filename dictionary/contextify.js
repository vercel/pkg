'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/contextify.js': [
        'require(\'bindings\')(\'contextify\')',
        'require(\'bindings\')({ bindings: \'contextify\', module_root: __dirname + \'/..\' })'
      ]
    }
  }
};
