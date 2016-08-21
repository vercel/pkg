function Store () {
  this.emit = function () {};
}

function MemoryStore () {
}

let session = { Store: Store, MemoryStore: MemoryStore };
let RedisStore = require('connect-redis')(session);
if (typeof RedisStore === 'function') {
  console.log('ok');
}
