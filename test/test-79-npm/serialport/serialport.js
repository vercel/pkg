let serialport = require('serialport');
if (typeof serialport.list === 'function') {
  console.log('ok');
}
