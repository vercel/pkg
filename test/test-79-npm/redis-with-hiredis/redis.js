let redis = require('redis');
let client = redis.createClient();

client.on('error', function (error) {
  let ok = error.message.indexOf('ECONNREFUSED') >= 0;
  if (ok) console.log('ok');
  process.exit();
});
