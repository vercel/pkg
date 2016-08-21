let Promise = require('native-or-bluebird');
if (Promise && global.Promise) {
  console.log('ok');
}
