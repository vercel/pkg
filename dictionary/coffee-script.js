'use strict';

module.exports = {

  scripts: [
    'lib/coffee-script/*.js'
  ],

  patches: {

    'lib/coffee-script/grammar.js': [
      'require(\'jison\')',
      'require(\'jison\', \'can-ignore\')'
    ]

  }

};
