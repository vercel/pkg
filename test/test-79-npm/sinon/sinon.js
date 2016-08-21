let sinon = require('sinon');
let callback = sinon.spy();
callback();
if (callback.called) {
  console.log('ok');
}
