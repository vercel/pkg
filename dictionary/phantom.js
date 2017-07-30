'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/phantom.js': [
        '__dirname + \'/shim/index.js\'',
        '_path2.default.join(_path2.default.dirname(process.execPath), \'shim/index.js\')'
      ]
    },
    deployFiles: [
      [ 'node_modules/phantom/lib/shim/index.js', 'shim/index.js' ],
      [ 'node_modules/phantom/lib/shim/function_bind_polyfill.js', 'shim/function_bind_polyfill.js' ]
    ]
  }
};
