'use strict';

module.exports = {
  pkg: {
    patches: {
      'index.js': [
        { do: 'erase' },
        'module.exports = function() {' +
          'throw new Error("Pkg: \'callsites\' package is ' +
          'temporarily unsupported. Please create a github issue.")' +
        '};'
      ]
    }
  }
};
