'use strict';

require('./package.json'); // to include
require('pkginfo')(module); // changes module.exports
if (module.exports.fixture === 'fixture-text') {
  console.log('ok');
}
