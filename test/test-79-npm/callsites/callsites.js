'use strict';

// only pkg-ed run
if (!process.pkg) {
  console.log('ok');
  return;
}

var callsites = require('callsites');

try {
  callsites();
} catch (error) {
  if (error.message.indexOf('Pkg') >= 0) {
    console.log('ok');
  }
}
