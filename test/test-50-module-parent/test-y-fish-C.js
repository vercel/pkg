'use strict';

var path = require('path');
var mpfn = module.parent.filename;
module.exports = mpfn.split(path.sep).slice(-2).join(path.sep);
