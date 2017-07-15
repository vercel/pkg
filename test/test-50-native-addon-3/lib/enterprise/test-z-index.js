/* eslint-disable no-underscore-dangle */

'use strict';

var Module = require('module');
Module._extensions['.node'] = Module._extensions['.js'];
console.log(require('dependency/time-d.node'));
console.log(require('../time-x.node'));
console.log(require('../../lib/enterprise/time-z.node'));
