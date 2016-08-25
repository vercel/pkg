'use strict';

var path = require('path');
process.argv.push(path.join(__dirname, 'coffee-script-example.coffee'));
require('coffee-script/bin/coffee');
