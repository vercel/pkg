'use strict';

module.exports = {
  pkg: {
    scripts: [
      'lib/*.js'
    ],
    deployFiles: [
      [ 'build/Release/sharp.node', 'node_modules/sharp/build/Release/sharp.node' ],
      [ 'vendor/lib', 'node_modules/sharp/vendor/lib' ]
    ]
  }
};
