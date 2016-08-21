let optimist = require('optimist');
let argv = optimist.argv;
if (argv.$0) {
  console.log('ok');
}
