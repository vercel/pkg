'use strict';

module.exports = {
  pkg: {
    patches: {
      'index.js': [
        'require(\'bindings\')(\'time.node\')',
        'require(\'bindings\')({ bindings: \'time.node\', module_root: __dirname })'
      ]
    }
  }
};
