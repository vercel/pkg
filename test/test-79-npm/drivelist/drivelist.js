let fs = require('fs');
let path = require('path');
let mkdirp = require('../../../node_modules/mkdirp');
let rimraf = require('../../../node_modules/rimraf');

mkdirp.sync('scripts');

let drivelistPath = path.dirname(require.resolve('drivelist'));
let scriptsPath = path.join(drivelistPath, '..', 'scripts');
fs.readdirSync(scriptsPath).some(function (file) {
  let full = 'scripts/' + file;
  let source = fs.readFileSync(path.join(scriptsPath, file));
  fs.writeFileSync(full, source);
  fs.chmodSync(full, 511); // 777
});

let drivelist = require('drivelist');
drivelist.list(function (error, list) {
  if (error) throw error;
  rimraf.sync('scripts');
  if (list.length > 0) {
    console.log('ok');
  }
});
