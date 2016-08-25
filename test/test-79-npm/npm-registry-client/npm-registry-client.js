'use strict';

var RegistryClient = require('npm-registry-client');
var client = new RegistryClient({});
if (typeof client.whoami === 'function') {
  console.log('ok');
}
