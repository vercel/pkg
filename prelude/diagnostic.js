/* eslint-disable global-require */
/* eslint-disable no-console */
/* global DICT */

'use strict';

function humanSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  if (bytes === 0) {
    return 'n/a';
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  if (i === 0) {
    return `${bytes} ${sizes[i]}`;
  }

  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
}

(function installDiagnostic() {
  const fs = require('fs');
  const path = require('path');
  const win32 = process.platform === 'win32';

  const sizeLimit = process.env.SIZE_LIMIT_PKG
    ? parseInt(process.env.SIZE_LIMIT_PKG, 10)
    : 5 * 1024 * 1024;
  const folderLimit = process.env.FOLDER_LIMIT_PKG
    ? parseInt(process.env.FOLDER_LIMIT_PKG, 10)
    : 10 * 1024 * 1024;

  if (process.env.DEBUG_PKG === '2') {
    console.log(Object.entries(DICT));
  }

  const overSized = [];

  function dumpLevel(filename, level, tree) {
    let totalSize = 0;
    const d = fs.readdirSync(filename);
    for (let j = 0; j < d.length; j += 1) {
      const f = path.join(filename, d[j]);
      const realPath = fs.realpathSync(f);
      const isSymbolicLink2 = f !== realPath;

      const s = fs.statSync(f);

      if (s.isDirectory() && !isSymbolicLink2) {
        const tree1 = [];
        const startIndex = overSized.length;
        const folderSize = dumpLevel(f, level + 1, tree1);
        totalSize += folderSize;
        const str =
          (' '.padStart(level * 2, ' ') + d[j]).padEnd(40, ' ') +
          (humanSize(folderSize).padStart(10, ' ') +
            (isSymbolicLink2 ? `=> ${realPath}` : ' '));
        tree.push(str);
        tree1.forEach((x) => tree.push(x));

        if (folderSize > folderLimit) {
          overSized.splice(startIndex, 0, str);
        }
      } else {
        totalSize += s.size;
        const str =
          (' '.padStart(level * 2, ' ') + d[j]).padEnd(40, ' ') +
          (humanSize(s.size).padStart(10, ' ') +
            (isSymbolicLink2 ? `=> ${realPath}` : ' '));

        if (s.size > sizeLimit) {
          overSized.push(str);
        }

        tree.push(str);
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
    console.log(startFolder);

    const tree = [];
    const totalSize = dumpLevel(startFolder, 1, tree);
    console.log(tree.join('\n'));

    console.log('Total size = ', humanSize(totalSize));

    if (overSized.length > 0) {
      console.log('------------------------------- oversized files');
      console.log(overSized.join('\n'));
    }

    if (process.env.DEBUG_PKG === '2') {
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
  }
})();
