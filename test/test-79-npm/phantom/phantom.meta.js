'use strict';

module.exports = function (stamp) {
  return {
    allow: (!(/^arm/).test(stamp.a)),
    deployFiles: [
      [ 'node_modules/phantom/lib/shim/index.js', 'shim/index.js' ],
      [ 'node_modules/phantom/lib/shim/function_bind_polyfill.js', 'shim/function_bind_polyfill.js' ],
      [ 'node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs', 'phantomjs' ]
    ]
  };
};
