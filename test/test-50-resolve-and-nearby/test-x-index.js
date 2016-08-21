let fs = require('fs');
let path = require('path');

console.log([

  require('test-y-fish'), // both should have same names
  fs.readFileSync(path.join(__dirname, 'test-y-fish'))

].join('\n'));
