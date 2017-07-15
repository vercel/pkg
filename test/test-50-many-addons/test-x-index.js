/* eslint-disable no-underscore-dangle */

'use strict';

const Module = require('module');
Module._extensions['.node'] = Module._extensions['.js'];
console.log(typeof require('./time.node').time);
console.log(typeof require('./sub1/time.node').time);
console.log(typeof require('./sub1/sub2/time.node').time);
