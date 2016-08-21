let Parser = require('redis-parser');
let parser = new Parser({
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
