'use strict';

var sinon = require('sinon');
var callback = sinon.spy();
callback();
if (callback.called) {
  console.log('ok');
}
