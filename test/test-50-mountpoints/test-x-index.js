'use strict';

var fs = require('fs');
var path = require('path');

require('./plugins-C-int/test-y-require-C.js');

// require(path.join(path.dirname(process.execPath), "plugins-D-ext/test-y-require-D.js"));

var myDirectory = path.dirname(process.execPath);

process.pkg.mount(
  path.join(__dirname, 'plugins-D-ext'),
  path.join(myDirectory, 'plugins-D-ext')
);

require('./plugins-D-ext/test-y-require-D.js'.slice());

console.log(
  fs.readdirSync(__dirname).join('\n')
);
