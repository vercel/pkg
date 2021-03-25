'use strict';

var Parser = require('redis-parser');
var parser = new Parser({
  name: 'auto',
  returnReply: function (reply) {
    console.log(reply);
  },
  returnError: function (error) {
    console.log(error);
  },
  returnFatalError: function (error) {
    console.log(error);
  },
});

if (Array.isArray(parser.bufferCache)) {
  console.log('ok');
}
