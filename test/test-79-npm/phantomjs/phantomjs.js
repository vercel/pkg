'use strict';

// в скомпилированном состоянии не сможет
// найти екзешник, поэтому формальная проверка

var phantomjs = require('phantomjs');
if (phantomjs.version) {
  console.log('ok');
}
