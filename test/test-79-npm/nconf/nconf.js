'use strict';

var nconf = require('nconf');
nconf.argv();
var foo = nconf.get('foo');
if (typeof foo === 'undefined') {
  console.log('ok');
}
