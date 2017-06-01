'use strict';

module.exports = {
  pkg: {
    scripts: [
      'src/*.js'
    ],
    patches: {
      'src/exec.js': [
        'execCommand = JSON.stringify(process.execPath) + \' \' + JSON.stringify(scriptFile)',
        'execCommand = JSON.stringify(process.execPath) + \' --pkg-fallback \' + JSON.stringify(scriptFile)',
        'execCommand = \'"\'+process.execPath+\'" \'+scriptFile',
        'execCommand = \'"\'+process.execPath+\'" --pkg-fallback \'+scriptFile', // for 0.6.0
        'execCommand = JSON.stringify(common.config.execPath) + \' \' + JSON.stringify(scriptFile)',
        'execCommand = JSON.stringify(common.config.execPath) + \' --pkg-fallback \' + JSON.stringify(scriptFile)' // for 0.7.6 after https://github.com/shelljs/shelljs/commit/4c48631
      ],
      'shell.js': [
        '\'"\'+process.execPath+\'" \'+scriptFile',
        '\'"\'+process.execPath+\'" --pkg-fallback \'+scriptFile' // for 0.1.4
      ]
    }
  }
};
