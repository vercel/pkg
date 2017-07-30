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
      [ 'node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs', 'phantomjs' ],
      [ 'node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs.exe', 'phantomjs.exe' ]
    ]
  }
};
