'use strict';

module.exports = {

  patches: {

    'src/exec.js': [
      'execCommand = JSON.stringify(process.execPath) + \' \' + JSON.stringify(scriptFile)',
      'execCommand = JSON.stringify(process.execPath) + \' --entrypoint \' + JSON.stringify(scriptFile)',
      'execCommand = \'"\'+process.execPath+\'" \'+scriptFile',
      'execCommand = \'"\'+process.execPath+\'" --entrypoint \'+scriptFile' // for 0.6.0
    ],

    'shell.js': [
      '\'"\'+process.execPath+\'" \'+scriptFile',
      '\'"\'+process.execPath+\'" --entrypoint \'+scriptFile' // for 0.1.4
    ]

  }

};
