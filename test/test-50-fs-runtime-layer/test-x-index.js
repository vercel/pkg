'use strict';

require('./test-x1-index.js');
setTimeout(function () {
  require('./test-x2-index.js');
  setTimeout(function () {
    require('./test-x3-index.js');
  }, 100);
}, 100);
