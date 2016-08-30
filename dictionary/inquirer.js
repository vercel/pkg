'use strict';

module.exports = {
  pkgConfig: {
    patches: {
      // npm install eslint почему-то не
      // ставит through, нужный для inquirer.
      // TODO убери когда шлютер поправит
      'lib/ui/bottom-bar.js': [
        'require("through")',
        'require("through", "may-exclude")'
      ]
    }
  }
};
