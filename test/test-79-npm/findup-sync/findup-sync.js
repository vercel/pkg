'use strict';

let findup = require('findup-sync');
let pj = findup('package.json');
console.log(pj ? 'ok' : 'bad');
