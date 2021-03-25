'use strict';

function Store() {
  this.emit = function () {};
}

function MemoryStore() {}

var session = { Store: Store, MemoryStore: MemoryStore };
var MongoStore = require('connect-mongo')(session);
if (typeof MongoStore === 'function') {
  console.log('ok');
}
