let minimatch = require('minimatch');
if (minimatch('bar.foo', '*.foo') &&
    !minimatch('bar.foo', '*.bar')) {
  console.log('ok');
}
