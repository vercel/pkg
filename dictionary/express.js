'use strict';

module.exports = {

  patches: {

    'index.js': [
      'require(\'./lib-cov/express\')',
      'require(\'./lib-cov/express\', \'can-ignore\')'
    ],

    'lib/view.js': [
      'path = join(this.root, path)',
      'path = process.enclose.path.resolve(this.root, path)', // for 3.x
      'loc = resolve(root, name)',
      'loc = process.enclose.path.resolve(root, name)' // for 4.x
    ]

  }

};
