'use strict';

function Store() {
  this.emit = function () {};
}

function MemoryStore() {}

var session = { Store: Store, MemoryStore: MemoryStore };
var RedisStore = require('connect-redis')(session);
if (typeof RedisStore === 'function') {
  console.log('ok');
}
