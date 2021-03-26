'use strict';

var extender = require('extender');

var e = extender.define({
  multiply: function (str, times) {
    var ret = str;
    for (var i = 1; i < times; i += 1) {
      ret += str;
    }
    return ret;
  },
});

var v = e('hello').multiply(2).value();

if (v === 'hellohello') {
  console.log('ok');
}
