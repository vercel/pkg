let shell = require('shelljs');
let windows = process.platform === 'win32';
let result = shell.exec(windows ? 'dir' : 'ls', { silent: true });
let data = result.stdout || result.output;
if (data.length >= 2) {
  console.log('ok');
}
