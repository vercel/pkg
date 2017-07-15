/* eslint-disable no-underscore-dangle */

'use strict';

const Module = require('module');
Module._extensions['.node'] = Module._extensions['.js'];
console.log(typeof require('./node_modules/time.node').time);
console.log(typeof require('./lib/time.node').time);
console.log(typeof require('./lib/dependency/time.node').time);
