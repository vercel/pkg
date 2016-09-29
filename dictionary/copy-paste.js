'use strict';

module.exports = {
  pkg: {
    patches: {
      'platform/win32.js': [
        '".\\\\fallbacks\\\\paste.vbs"',
        '"./fallbacks/paste.vbs"'
      ]
    }
  }
};
