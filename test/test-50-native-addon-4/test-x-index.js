/* eslint-disable no-underscore-dangle */

'use strict';

var fs = require('fs');
var path = require('path');
var Module = require('module');
Module._extensions['.node'] = Module._extensions['.js'];
console.log(fs.existsSync(path.join(__dirname, 'lib/time.node')));
console.log(require('./lib/time.node'));
