'use strict';

var log4js = require('log4js');
log4js.loadAppender('file');
var logger = log4js.getLogger('cheese');
logger.setLevel('ERROR');
console.log('ok');
