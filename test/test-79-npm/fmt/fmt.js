let fmt = require('fmt');

let save;
console.log = function (s) {
  save = s;
};

fmt.sep();

if (save.slice(0, 3) === '===') {
  process.stdout.write('ok\n');
}
