'use strict';

let mkdirp = require('mkdirp');
let path = require('path');
let rimraf = require('rimraf');
let execSync = require('child_process').execSync;
let spawnSync = require('child_process').spawnSync;
let existsSync = require('fs').existsSync;
let stableStringify = require('json-stable-stringify');

module.exports.mkdirp = mkdirp;

module.exports.pause = function (seconds) {
  spawnSync(
    'ping', [ '127.0.0.1',
      process.platform === 'win32' ? '-n' : '-c',
    (seconds + 1).toString()
  ]);
};

module.exports.vacuum = function () {
  throw new Error('Async vacuum not implemented');
};

module.exports.vacuum.sync = function (p) {
  let limit = 5;
  let hasError;
  for (let i = 0; i < limit; i += 1) {
    hasError = null;
    try {
      rimraf.sync(p);
    } catch (error) {
      hasError = error;
    }
    if (!hasError) break;
    if (i < limit - 1) {
      module.exports.pause(5);
    }
  }
  if (hasError) {
    throw hasError;
  }
};

module.exports.exec = function () {
  throw new Error('Async exec not implemented');
};

module.exports.exec.sync = function (command, opts) {

  let child = execSync(command, opts);
  return child.toString();

};

module.exports.spawn = function () {
  throw new Error('Async spawn not implemented');
};

module.exports.spawn.sync = function (command, args, opts) {

  if (!opts) opts = {};
  opts = JSON.parse(JSON.stringify(opts)); // change own copy
  let p = 'pipe', i = 'inherit';

  let d = opts.stdio;
  if (d === 'super-pipe') {
    opts.stdio = [ p, p, p ];
  } else {
    if (!d) {
      opts.stdio = [ p, p, p ];
    } else
    if (typeof d === 'string') {
      opts.stdio = [ d, d, d ];
    }
    opts.stdio[2] = i;
  }

  let expect = opts.expect || 0;
  delete opts.expect; // to avoid passing to spawnSync
  let opts2 = JSON.parse(JSON.stringify(opts)); // 0.12.x spoils
  let child = spawnSync(command, args, opts2);
  if (child.error) throw child.error;
  let s = child.status;
  if (s !== expect) {
    throw new Error('Status ' + s.toString() +
      ', expected ' + expect.toString());
  }

  if ((opts.stdio[1] === 'pipe') &&
      (opts.stdio[2] === 'pipe')) {
    return {
      stdout: child.stdout.toString(),
      stderr: child.stderr.toString()
    };
  } else
  if (opts.stdio[1] === 'pipe') {
    return child.stdout.toString();
  } else
  if (opts.stdio[2] === 'pipe') {
    return child.stderr.toString();
  } else {
    return '';
  }

};

const es5path = path.resolve(__dirname, './lib-es5/bin.js');
const es7path = path.resolve(__dirname, './lib/bin.js');

module.exports.make = function (args) {
  args = args.slice(0);
  const es5 = existsSync(es5path);
  const binPath = es5 ? es5path : es7path;
  args.unshift(binPath);
  if (!es5) args.unshift('-r', 'babel-register');
  const opts = { stdio: 'inherit' };
  module.exports.spawn.sync('node', args, opts);
};

module.exports.stringify = function (obj, replacer, space) {
  return stableStringify(obj, { replacer, space });
};
