'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'platform/win32.js': [
        '".\\\\fallbacks\\\\paste.vbs"',
        '"./fallbacks/paste.vbs"'
      ]
    }
  }
};
