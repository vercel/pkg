'use strict';

module.exports = {
  pkg: {
    scripts: [
      'lib/*.js'
    ],
    deployFiles: [
      [ 'build/Release/sharp.node', 'sharp/build/Release/sharp.node' ],
      [ 'vendor/lib', 'sharp/vendor/lib' ]
    ]
  }
};
