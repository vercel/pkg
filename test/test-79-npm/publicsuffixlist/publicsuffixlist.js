'use strict';

if (process.pkg) {
  let hasBadDeps = true;
  try {
    require('./node_modules/istanbul', 'must-exclude');
  } catch (_) {
    hasBadDeps = false;
  }
  // istanbul must be in devDeps, not in deps
  if (hasBadDeps) return;
}

var PublicSuffixList = require('publicsuffixlist');
var list = new PublicSuffixList();
list.initializeSync();
var result = list.lookup('www.domain.com');
if (result.tld === 'com') {
  console.log('ok');
}
