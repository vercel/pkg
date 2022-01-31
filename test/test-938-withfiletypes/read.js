'use strict';

const fs = require('fs');

console.log('Starting sync read');
console.log(
  serializeFiles(fs.readdirSync('/', { encoding: 'utf8', withFileTypes: true }))
);
console.log('Finishing sync read');

console.log('Starting async read');
fs.readdir('/', { encoding: 'utf8', withFileTypes: true }, (_err, files) => {
  console.log(serializeFiles(files));
  console.log('Finishing async read');
});

function serializeFiles(files) {
  return JSON.stringify(
    files.map((file) => `${file.name} ${file.isFile()}`),
    null,
    2
  );
}
