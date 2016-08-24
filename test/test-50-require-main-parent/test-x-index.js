/* eslint-disable no-nested-ternary */

'use strict';

var fs = require('fs');

console.log([
  typeof process.argv[0],
  typeof process.argv[1],
  process.platform === 'win32' ? fs.existsSync(process.argv[0]) : 'empty',
  fs.existsSync(process.argv[1]), // argv[0] is just "node" in linux
  __dirname,
  __filename,
  typeof module.filename,
  module.filename ? module.filename : 'empty',
  typeof module.parent,
  module.parent ? (typeof module.parent.filename) : 'empty',
  module.parent ? (module.parent.filename ? module.parent.filename : 'empty') : 'empty',
  typeof module.require,
  typeof global,
  // в nodejs они разные // (module.require === require).toString(),
  typeof require.main,
  (require.main === module).toString(),
  typeof require.main.parent,
  (require.main.parent || 'null').toString(),
  require.main.parent ? require.main.parent.id : 'empty',
  require.main.parent ? require.main.parent.filename : 'empty',
  typeof require.cache,
  typeof global,
  typeof global.setTimeout,
  global.module ? (global.module === module).toString() : 'true',
  global.require ? (global.require === require).toString() : 'true'
]/**/.concat(
  require('./test-y-require-A.js')
).concat(
  require('./test-y-require-A.js')
).concat(
  require('../test-50-require-main-parent/test-y-require-B.js')
).concat(
  require('../test-50-require-main-parent/test-y-require-B.js')
).concat(
  require('./sub/test-y-require-C.js')
).concat(
  require('./sub/test-y-require-C.js')
).concat(
  require('../test-50-require-main-parent/sub/test-y-require-D.js')
).concat(
  require('../test-50-require-main-parent/sub/test-y-require-D.js')
)/**/.join('\n'));
