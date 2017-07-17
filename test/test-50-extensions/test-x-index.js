/* eslint-disable no-underscore-dangle */

var Module = require('module');
var fs = require('fs');

Module._extensions['.js'] = function (module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  // emulating babel-register
  content = content.replace(
    'import x from \'./test-z-sub.js\';',
    'require(\'./test-z-sub.js\');');
  module._compile(content, filename);
};

require('./test-y-esnext.js');
