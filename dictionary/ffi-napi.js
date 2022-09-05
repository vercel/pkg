'use strict';

module.exports = {
  pkg: {
    patches: {
      // This patch reimplements the file extraction logic found in the
      // `prelude/bootstrap.js` file's dlopen() function. This is needed
      // because pkg's dlopen() ends up calling Node's process.dlopen(),
      // which is not appropriate for loading shared libraries with ffi-napi.
      'lib/dynamic_library.js': [
        'this._path = path;',
        `
        if (path.startsWith('/snapshot/')) {
          const Fs = require('fs');
          const moduleContent = Fs.readFileSync(path);
          const hash = require('crypto')
            .createHash('sha256')
            .update(moduleContent)
            .digest('hex');
          const Path = require('path');
          const tmpFolder = Path.join(require('os').tmpdir(), 'pkg', hash);
          const newPath = Path.join(tmpFolder, Path.basename(path));
          if (!Fs.existsSync(tmpFolder)) {
            Fs.mkdirSync(tmpFolder, { recursive: true });
            Fs.copyFileSync(path, newPath);
          }
          path = newPath;
        }
        this._path = path;
        `,
      ],
    },
  },
};
