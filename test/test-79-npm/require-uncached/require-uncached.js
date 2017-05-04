'use strict';

var require2 = require('require-uncached');
var depsOfPkg = require('../../../package.json').dependencies;
var anyDep = Object.keys(depsOfPkg)[0];
var result = require2(anyDep);
if (typeof result !== 'undefined') {
  console.log('ok');
}
