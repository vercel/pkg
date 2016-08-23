'use strict';

let tmp = require('tmp');
if (tmp.fileSync) {
  console.log('ok');
}
