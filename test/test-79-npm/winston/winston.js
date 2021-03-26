/* eslint-disable no-underscore-dangle */

'use strict';

process.stdout._write_ = process.stdout.write;
process.stdout.write = function (m) {
  process.stdout._write_(m.slice(m.indexOf(': ') + 2));
};

var winston = require('winston');
var Logger = winston.Logger;
var Console = winston.transports.Console;
new Logger({ transports: [new Console()] }); // eslint-disable-line no-new
winston.log('info', 'ok');
