'use strict';

require('elasticsearch');
var Log = require('elasticsearch/src/lib/log.js');
var log = new Log({ log: ['warning'] });
log.warning('warning');
console.log('ok');
