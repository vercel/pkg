let yargs = require('yargs');
let argv = yargs.argv;
if (argv.$0) {
  console.log('ok');
}
