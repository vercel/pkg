'use strict';

let msgpack = require('msgpack');
let o = { 'a': 1, 'b': 2, 'c': [ 1, 2, 3 ] };
let b = msgpack.pack(o);
let oo = msgpack.unpack(b);
if (JSON.stringify(o) === JSON.stringify(oo)) {
  console.log('ok');
}
