/* eslint-disable no-underscore-dangle */

'use strict';

var fs = require('fs');
var path = require('path');
var Module = require('module');
Module._extensions['.node'] = Module._extensions['.js'];
console.log(fs.existsSync(path.join(__dirname, '../node_modules/dependency/time-d.node')));
console.log(require('dependency/time-d.node'));
console.log(fs.existsSync(path.join(__dirname, 'time-x.node')));
console.log(require('./time-x.node'));
console.log(fs.existsSync(path.join(__dirname, 'community/time-y.node')));
console.log(require('./community/time-y.node'));
console.log(fs.existsSync(path.join(__dirname, '../lib/enterprise/time-z.node')));
console.log(require('../lib/enterprise/time-z.node'));
