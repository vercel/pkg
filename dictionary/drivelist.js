'use strict';

module.exports = {
  pkg: {
    patches: {
      'build/scripts.js': [
        'path.join(__dirname, \'..\', \'scripts\')',
        'path.join(path.dirname(process.execPath), \'scripts\')'
      ],
      'lib/scripts.js': [
        'path.join(__dirname, \'..\', \'scripts\')',
        'path.join(path.dirname(process.execPath), \'scripts\')' // for 4.0.0
      ]
    },
    deployFiles: [
      [ 'scripts/darwin.sh', 'scripts/darwin.sh' ],
      [ 'scripts/linux.sh', 'scripts/linux.sh' ],
      [ 'scripts/win32.bat', 'scripts/win32.bat' ]
    ]
  }
};
