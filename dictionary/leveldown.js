'use strict';

module.exports = {
  pkg: {
    patches: {
      'leveldown.js': [
        'require(\'bindings\')(\'leveldown\')',
        'require(\'bindings\')({ bindings: \'leveldown\', module_root: __dirname })'
      ]
    }
  }
};
