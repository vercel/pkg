/* eslint-disable no-nested-ternary */

'use strict';

module.exports = [
  __dirname,
  __filename,
  typeof module.filename,
  module.filename ? module.filename : 'empty',
  typeof module.parent,
  module.parent ? typeof module.parent.filename : 'empty',
  module.parent
    ? module.parent.filename
      ? module.parent.filename
      : 'empty'
    : 'empty',
  typeof module.require,
  typeof global,
  // в nodejs они разные // (module.require === require).toString(),
  typeof require.main,
  (require.main === module).toString(),
  typeof require.main.parent,
  (require.main.parent || 'null').toString(),
  require.main.parent ? require.main.parent.id : 'empty',
  require.main.parent ? require.main.parent.filename : 'empty',
  typeof global,
  typeof global.setTimeout,
  global.module ? (global.module === module).toString() : 'true',
  global.require ? (global.require === require).toString() : 'true',
];
