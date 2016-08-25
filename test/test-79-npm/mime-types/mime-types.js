'use strict';

var mime = require('mime-types');
if (mime.lookup('html') === 'text/html') {
  console.log('ok');
}
