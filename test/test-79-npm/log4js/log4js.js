'use strict';

let log4js = require('log4js');
log4js.loadAppender('file');
let logger = log4js.getLogger('cheese');
logger.setLevel('ERROR');
console.log('ok');
