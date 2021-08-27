'use strict';

const fs = require('fs');
const path = require('path');

console.log('Starting sync read');

console.log(
  serializeFiles(
    fs.readdirSync(path.join(__dirname, 'files'), { withFileTypes: true })
  )
);

console.log('Finishing sync read');

console.log('Starting async read');

fs.readdir(
  path.join(__dirname, 'files'),
  { withFileTypes: true },
  (_err, files) => {
    console.log(serializeFiles(files));
    console.log('Finishing async read');
  }
);

function serializeFiles(files) {
  return files.map((file) => `name: ${file.name}, isFile: ${file.isFile()}`);
}
