'use strict';

var path = require('path');
var config = require('interpret').extensions;
var rechoir = require('rechoir');
require('coffee-script/register');
rechoir.prepare(config, './fixture.coffee');
var filename = path.join(__dirname, 'fixture.coffee');
var coffee = require(filename);

if (typeof coffee.root === 'function') {
  console.log('ok');
}
