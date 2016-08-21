'use strict';

let RegistryClient = require('npm-registry-client');
let client = new RegistryClient({});
if (typeof client.whoami === 'function') {
  console.log('ok');
}
