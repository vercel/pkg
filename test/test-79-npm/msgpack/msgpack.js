'use strict';

var msgpack = require('msgpack');
var o = { a: 1, b: 2, c: [1, 2, 3] };
var b = msgpack.pack(o);
var oo = msgpack.unpack(b);
if (JSON.stringify(o) === JSON.stringify(oo)) {
  console.log('ok');
}
