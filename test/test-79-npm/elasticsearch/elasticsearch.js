require('elasticsearch');
let Log = require('elasticsearch/src/lib/log.js');
let log = new Log({ log: [ 'warning' ] });
log.warning('warning');
console.log('ok');
