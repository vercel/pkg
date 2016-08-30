'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      'index.js': [
        'require("./platform/openbsd")',
        'require("./platform/openbsd", "may-exclude")'
      ],
      'platform/win32.js': [
        '".\\\\fallbacks\\\\paste.vbs"',
        '"./fallbacks/paste.vbs"'
      ]
    }
  }
};
