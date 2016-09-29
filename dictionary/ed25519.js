'use strict';

module.exports = {
  pkg: {
    patches: {
      'index.js': [
        'require(\'bindings\')(\'ed25519\')',
        'require(\'bindings\')({ bindings: \'ed25519\', module_root: __dirname })'
      ]
    }
  }
};
