'use strict';

var findup = require('findup-sync');
var pj = findup('package.json');
console.log(pj ? 'ok' : 'bad');
