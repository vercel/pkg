let zookeeper = require('node-zookeeper-client');
let client = zookeeper.createClient('localhost:2181');
if (client.state) {
  console.log('ok');
}
