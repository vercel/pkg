'use strict';

let nconf = require('nconf');
nconf.argv();
let foo = nconf.get('foo');
if (typeof foo === 'undefined') {
  console.log('ok');
}
