'use strict';

module.exports = {

  patches: {

    'index.js': [
      'resolve.sync(this.moduleName, {basedir: configBase || cwd, paths: paths})',
      'resolve.sync(this.moduleName, {basedir: configBase || require.main.filename, paths: paths})'
    ]

  }

};
