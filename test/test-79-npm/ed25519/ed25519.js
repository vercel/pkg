'use strict';

var ed25519 = require('ed25519');
if (ed25519.MakeKeypair) {
  console.log('ok');
}
