'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/phantom.js': [
        '__dirname + \'/shim/index.js\'',
        '_path2.default.join(_path2.default.dirname(process.execPath), \'shim/index.js\')'
      ]
    }
  }
};
