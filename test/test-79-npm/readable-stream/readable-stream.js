'use strict';

let fs = require('fs');
let path = require('path');
let fst = fs.createReadStream(path.join(__dirname, 'readable-stream.js'));
let Readable = require('readable-stream');
let rst = new Readable();
rst.wrap(fst);

setTimeout(function () {
  let test = '"use strict";';
  let c = rst.read(test.length);
  if (c.toString() === test) {
    console.log('ok');
  }
}, 100);
