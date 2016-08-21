/* eslint-disable no-underscore-dangle */

process.stdout._write_ = process.stdout.write;
process.stdout.write = function (m) {
  process.stdout._write_(m.slice(m.indexOf(': ') + 2));
};

let winston = require('winston');
let Logger = winston.Logger;
let Console = winston.transports.Console;
new Logger({ transports: [ new Console() ] }); // eslint-disable-line no-new
winston.log('info', 'ok');
