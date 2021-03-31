/* eslint-disable global-require */
/* eslint-disable no-console */

'use strict';

(function installDiagnostic() {
  const fs = require('fs');
  const path = require('path');

  const win32 = process.platform === 'win32';

  function dumpLevel(folderPath, level) {
    let totalSize = 0;
    const d = fs.readdirSync(folderPath);
    for (let j = 0; j < d.length; j += 1) {
      const f = path.join(folderPath, d[j]);
      //  const isSymbolicLink = fs.statSync(f).isSymbolicLink();
      const realPath = fs.realpathSync(f);
      const isSymbolicLink2 = f !== realPath;

      const s = fs.statSync(f);
      totalSize += s.size;
      console.log(
        ' '.padStart(level * 2, ' '),
        d[j],
        s.size,
        isSymbolicLink2 ? `=> ${realPath}` : ' '
      );

      if (s.isDirectory() && !isSymbolicLink2) {
        totalSize += dumpLevel(f, level + 1);
      }
    }
    return totalSize;
  }
  function wrap(obj, name) {
    const f = fs[name];
    obj[name] = (...args) => {
      const args1 = Object.values(args);
      console.log(
        `fs.${name}`,
        args1.filter((x) => typeof x === 'string')
      );
      return f.apply(this, args1);
    };
  }
  if (process.env.DEBUG_PKG) {
    console.log('------------------------------- virtual file system');
    const startFolder = win32 ? 'C:\\snapshot' : '/snapshot';
    const totalSize = dumpLevel(startFolder, 2);
    console.log('Total size = ', totalSize);
    wrap(fs, 'openSync');
    wrap(fs, 'open');
    wrap(fs, 'readSync');
    wrap(fs, 'read');
    wrap(fs, 'writeSync');
    wrap(fs, 'write');
    wrap(fs, 'closeSync');
    wrap(fs, 'readFileSync');
    wrap(fs, 'close');
    wrap(fs, 'readFile');
    wrap(fs, 'readdirSync');
    wrap(fs, 'readdir');
    wrap(fs, 'realpathSync');
    wrap(fs, 'realpath');
    wrap(fs, 'statSync');
    wrap(fs, 'stat');
    wrap(fs, 'lstatSync');
    wrap(fs, 'lstat');
    wrap(fs, 'fstatSync');
    wrap(fs, 'fstat');
    wrap(fs, 'existsSync');
    wrap(fs, 'exists');
    wrap(fs, 'accessSync');
    wrap(fs, 'access');
  }
})();
