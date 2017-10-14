'use strict';

var mime = require('mime');
if (mime.lookup('html') === 'text/html') {
  console.log('ok');
}
