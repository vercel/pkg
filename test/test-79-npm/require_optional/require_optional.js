'use strict';

let require2 = require('require_optional');
let async = require2('async');
if (async.waterfall) {
  console.log('ok');
}
