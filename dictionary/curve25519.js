'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'index.js': [
        'require("bindings")("curve")',
        'require("bindings")({ bindings: "curve", module_root: __dirname })'
      ]
    }
  }
};
