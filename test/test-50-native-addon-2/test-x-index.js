/* eslint-disable no-underscore-dangle */

'use strict';

var Module = require('module');
Module._extensions['.node'] = Module._extensions['.js'];
console.log(typeof require('dependency/time.node').time);
console.log(typeof require('./lib/time.node').time);
console.log(typeof require('./lib/enterprise/time.node').time);
