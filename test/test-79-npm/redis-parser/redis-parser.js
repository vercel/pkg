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
  }
});

if (typeof parser.name === 'string') {
  console.log('ok');
}
