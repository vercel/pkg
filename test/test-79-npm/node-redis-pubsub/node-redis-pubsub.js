let NRP = require('node-redis-pubsub');
let config = { port: 6379, scope: 'demo' };
new NRP(config); // eslint-disable-line no-new

process.on('uncaughtException', function (error) {
  let ok = error.code === 'ECONNREFUSED';
  if (ok) console.log('ok');
  process.exit();
});
