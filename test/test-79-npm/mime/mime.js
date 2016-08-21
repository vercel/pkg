'use strict';

let mime = require('mime');
if (mime.lookup('html') === 'text/html') {
  console.log('ok');
}
