/* eslint-disable no-underscore-dangle */

'use strict';

const Module = require('module');
Module._extensions['.node'] = Module._extensions['.js'];
console.log(typeof require('dependency/time.node').time);
