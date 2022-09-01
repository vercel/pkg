'use strict';

var fs = require('fs');
var path = require('path');

var myDirectory = path.dirname(process.execPath);

process.pkg.mount(
  path.join(__dirname, 'plugins-D-ext'),
  path.join(myDirectory, 'plugins-D-ext')
);

fs.mkdirSync('./plugins-D-ext/');
fs.writeFileSync('./plugins-D-ext/hello.txt', 'hello world!');

console.log(
  fs.readdirSync(path.join(__dirname, './plugins-D-ext/')).join('\n')
);
