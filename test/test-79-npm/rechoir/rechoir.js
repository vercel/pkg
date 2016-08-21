let config = require('interpret').extensions;
let rechoir = require('rechoir');
rechoir.prepare(config, './fixture.coffee');
let coffee = require('./fixture.coffee', 'dont-enclose');

if (typeof coffee.root === 'function') {
  console.log('ok');
}
