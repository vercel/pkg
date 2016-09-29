'use strict';

module.exports = {
  pkg: {
    patches: {
      'index.js': [
        'require("bindings")("curve")',
        'require("bindings")({ bindings: "curve", module_root: __dirname })'
      ]
    }
  }
};
