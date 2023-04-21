'use strict';

const assert = require('assert');
const path = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const globby = require('globby');
const { execSync } = require('child_process');
const { spawnSync } = require('child_process');
const { existsSync } = require('fs');
const stableStringify = require('json-stable-stringify');

module.exports.mkdirp = mkdirp;

module.exports.pause = function (seconds) {
  spawnSync('ping', [
    '127.0.0.1',
    process.platform === 'win32' ? '-n' : '-c',
    (seconds + 1).toString(),
  ]);
};

module.exports.vacuum = function () {
  throw new Error('Async vacuum not implemented');
};

module.exports.vacuum.sync = function (p) {
  const limit = 5;
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
  const child = execSync(command, opts);
  return (child || '').toString();
};

module.exports.spawn = function () {
  throw new Error('Async spawn not implemented');
};

module.exports.spawn.sync = function (command, args, opts) {
  if (!opts) opts = {};
  opts = Object.assign({}, opts); // change own copy

  const d = opts.stdio;
  if (!d) {
    opts.stdio = ['pipe', 'pipe', 'inherit'];
  } else if (typeof d === 'string') {
    opts.stdio = [d, d, d];
  }

  let expect = opts.expect === undefined ? 0 : opts.expect;
  delete opts.expect; // to avoid passing to spawnSync
  const opts2 = Object.assign({}, opts); // 0.12.x mutates
  const child = spawnSync(command, args, opts2);
  let s = child.status;
  // conform old node vers to https://github.com/nodejs/node/pull/11288
  if (child.signal) s = null;

  if (child.error || s !== expect) {
    if (opts.stdio[1] === 'pipe' && child.stdout) {
      process.stdout.write(child.stdout);
    } else if (opts.stdio[2] === 'pipe' && child.stderr) {
      process.stdout.write(child.stderr);
    }
    console.log('> ' + command + ' ' + args.join(' '));
  }

  if (child.error) {
    throw child.error;
  }
  if (s !== expect) {
    if (s === null) s = 'null';
    if (expect === null) expect = 'null';
    throw new Error(
      'Status ' + s.toString() + ', expected ' + expect.toString()
    );
  }

  if (opts.stdio[1] === 'pipe' && opts.stdio[2] === 'pipe') {
    return {
      stdout: child.stdout.toString(),
      stderr: child.stderr.toString(),
    };
  } else if (opts.stdio[1] === 'pipe') {
    return child.stdout.toString();
  } else if (opts.stdio[2] === 'pipe') {
    return child.stderr.toString();
  } else {
    return '';
  }
};

module.exports.pkg = function () {
  throw new Error('Async pkg not implemented');
};

const es5path = path.resolve(__dirname, '../lib-es5/bin.js');
const es7path = path.resolve(__dirname, '../lib/bin.js');

module.exports.pkg.sync = function (args, opts) {
  args = args.slice();
  const es5 = existsSync(es5path);
  const binPath = es5 ? es5path : es7path;
  args.unshift(binPath);
  assert(es5, 'RUN BABEL FIRST!'); // args.unshift('-r', 'babel-register');
  if (Array.isArray(opts)) opts = { stdio: opts };
  try {
    const ss = module.exports.spawn.sync;
    return ss('node', args, opts);
  } catch (error) {
    console.log(`> ${error.message}`);
    process.exit(2);
  }
};

module.exports.stringify = function (obj, replacer, space) {
  return stableStringify(obj, { replacer, space });
};

module.exports.filesBefore = function (n) {
  for (const ni of n) {
    module.exports.vacuum.sync(ni);
  }
  return globby.sync('**/*', { nodir: true }).sort();
};

module.exports.filesAfter = function (b, n) {
  const a = globby.sync('**/*', { nodir: true }).sort();
  for (const bi of b) {
    if (a.indexOf(bi) < 0) {
      assert(false, `${bi} disappeared!?`);
    }
  }
  const d = [];
  for (const ai of a) {
    if (b.indexOf(ai) < 0) {
      d.push(ai);
    }
  }
  assert(d.length === n.length, JSON.stringify([d, n]));
  for (const ni of n) {
    assert(d.indexOf(ni) >= 0, JSON.stringify([d, n]));
  }
  for (const ni of n) {
    module.exports.vacuum.sync(ni);
  }
};

module.exports.shouldSkipPnpm = function () {
  // pnpm 8 requires at least Node.js v16.14
  const REQUIRED_MAJOR_VERSION = 16;
  const REQUIRED_MINOR_VERSION = 14;

  const MAJOR_VERSION = parseInt(process.version.match(/v([0-9]+)/)[1], 10);
  const MINOR_VERSION = parseInt(
    process.version.match(/v[0-9]+\.([0-9]+)/)[1],
    10
  );

  const isDisallowedMajor = MAJOR_VERSION < REQUIRED_MAJOR_VERSION;
  const isDisallowedMinor =
    MAJOR_VERSION === REQUIRED_MAJOR_VERSION &&
    MINOR_VERSION < REQUIRED_MINOR_VERSION;
  if (isDisallowedMajor || isDisallowedMinor) {
    const need = `${REQUIRED_MAJOR_VERSION}.${REQUIRED_MINOR_VERSION}`;
    const got = `${MAJOR_VERSION}.${MINOR_VERSION}`;
    console.log(`skiping test as it requires nodejs >= ${need} and got ${got}`);
    return true;
  }

  return false;
};
