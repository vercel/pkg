'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/supervisor.js': [
        'var child = exports.child = spawn(exec, prog, {stdio: \'inherit\'});',
        'var prog2 = prog.slice();' +
        'if (process.pkg && exec === "node") {' +
          'exec = process.execPath;' +
          'prog2.unshift("--entrypoint");' +
        '};' +
        'var child = exports.child = spawn(exec, prog2, {stdio: \'inherit\'});'
      ]
    }
  }
};
