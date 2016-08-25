'use strict';

var conf = require('rc')('fixture.for.', {});
if (conf.NAME === 'VALUE') {
  console.log('ok');
}
