function Store () {
  this.emit = function () {};
}

function MemoryStore () {
}

let session = { Store: Store, MemoryStore: MemoryStore };
let MongoStore = require('connect-mongo')(session);
if (typeof MongoStore === 'function') {
  console.log('ok');
}
