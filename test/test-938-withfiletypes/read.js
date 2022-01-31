'use strict';

const fs = require('fs');

function isLastEntryDirent(files) {
  const last = files[files.length - 1];
  return (
    typeof last === 'object' &&
    typeof last.name === 'string' &&
    typeof last.type === 'number'
  );
}

const a = fs.readdirSync('/', { encoding: 'utf8', withFileTypes: true });
fs.readdir('/', { encoding: 'utf8', withFileTypes: true }, (err, b) => {
  if (err) throw err;
  if (isLastEntryDirent(a) && isLastEntryDirent(b)) {
    console.log('ok');
  }
});
