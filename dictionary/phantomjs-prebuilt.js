'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/phantomjs.js': [
        '__dirname, location.location',
        'path.dirname(process.execPath), path.basename(location.location)'
      ]
    },
    deployFiles: [
      [ 'lib/phantom/bin/phantomjs', 'phantomjs' ],
      [ 'lib/phantom/bin/phantomjs.exe', 'phantomjs.exe' ]
    ]
  }
};
