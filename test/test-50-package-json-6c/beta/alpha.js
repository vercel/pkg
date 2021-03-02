'use strict';

require('../beta');

if (process.pkg && require('path').sep === '/') {
  if (__dirname === '/snapshot/pkg/test/test-50-package-json-6c/beta') {
    try {
      console.log(require('fs').readFileSync('/snapshot/pkg/package.json', 'utf-8'));
    } catch (_) {
      // must not take pkg/package.json into executable
    }
  } else {
    require('assert')(__dirname === '/snapshot/beta');
  }
}
