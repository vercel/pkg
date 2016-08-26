'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'fsevents.js': [
        'require(\'./build/Release/fse\')',
        'require(\'./build/Release/fse\', \'can-ignore\')'
      ]
    }
  }
};
