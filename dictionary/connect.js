module.exports = {

  scripts: [
    'lib/middleware/*.js'
  ],

  assets: [
    'lib/public/**/*' // for connect@2.3
  ],

  patches: {

    'index.js': [
      'require(\'./lib-cov/connect\')',
      'require(\'./lib-cov/connect\', \'can-ignore\')' // for connect@2.3
    ],

    'lib/middleware/compiler.js': [
      'require(\'sass\')',
      'require(\'sass\', \'can-ignore\')',
      'require(\'less\')',
      'require(\'less\', \'can-ignore\')',
      'require(\'coffee-script\')',
      'require(\'coffee-script\', \'can-ignore\')'
    ]

  }

};
