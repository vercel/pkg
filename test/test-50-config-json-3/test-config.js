'use strict';

module.exports = {
  patches: {
    'test-x-index.js': [
      'require(__dirname + \'/\' + dataPath);',
      'require(process.cwd() + \'/\' + dataPath);'
    ]
  }
};
