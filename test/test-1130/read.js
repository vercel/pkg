'use strict';

// Thanks to @roberttod
// https://github.com/vercel/pkg/blob/59b1afdb39613777150c17f77b45595864ba072e/test/test-1103-readdirsync-withfiletypes/read.js

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
