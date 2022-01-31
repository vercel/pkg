'use strict';

const fs = require('fs');

fs.readdirSync('/', { encoding: 'utf8', withFileTypes: true });
fs.readdir('/', { encoding: 'utf8', withFileTypes: true }, (_err, _files) => {
  console.log('ok');
});
