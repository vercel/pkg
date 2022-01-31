'use strict';

const fs = require('fs');

function isLastEntryString(files) {
  const last = files[files.length - 1];
  return typeof last === 'string';
}

function isLastEntryDirent(files) {
  const last = files[files.length - 1];
  return (
    typeof last === 'object' &&
    typeof last.name === 'string' &&
    typeof last.type === 'number'
  );
}

// readdir root and verify that last pushed entry (snapshot in the binary) has the expected type

// expect Dirent array
const a = fs.readdirSync('/', { encoding: 'utf8', withFileTypes: true });
fs.readdir('/', { encoding: 'utf8', withFileTypes: true }, (err, b) => {
  if (err) throw err;
  if (isLastEntryDirent(a) && isLastEntryDirent(b)) {
    // expect string array
    const c = fs.readdirSync('/', { encoding: 'utf8', withFileTypes: false });
    fs.readdir('/', { encoding: 'utf8', withFileTypes: false }, (err_, d) => {
      if (err_) throw err_;
      if (isLastEntryString(c) && isLastEntryString(d)) {
        console.log('ok');
      }
    });
  }
});
