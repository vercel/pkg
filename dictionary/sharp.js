'use strict';

module.exports = {
  pkg: {
    scripts: [
      'lib/*.js'
    ],
    deployFiles: [
      [ 'build/Release', 'sharp/build/Release' ],
      [ 'vendor/lib', 'sharp/vendor/lib' ]
    ]
  }
};
