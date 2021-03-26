/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
/* eslint-disable curly */
/* eslint-disable new-cap */
/* eslint-disable no-buffer-constructor */
/* eslint-disable no-multi-spaces */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */

/* global EXECPATH_FD */
/* global PAYLOAD_POSITION */
/* global PAYLOAD_SIZE */
/* global REQUIRE_COMMON */
/* global VIRTUAL_FILESYSTEM */
/* global DEFAULT_ENTRYPOINT */

'use strict';

var common = {};
REQUIRE_COMMON(common);

const {
  STORE_BLOB,
  STORE_CONTENT,
  STORE_LINKS,
  STORE_STAT,
  isRootPath,
  normalizePath,
  insideSnapshot,
  stripSnapshot,
  removeUplevels,
} = common;

var FLAG_ENABLE_PROJECT = false;
var NODE_VERSION_MAJOR = process.version.match(/^v(\d+)/)[1] | 0;
var NODE_VERSION_MINOR = process.version.match(/^v\d+.(\d+)/)[1] | 0;

// /////////////////////////////////////////////////////////////////
// ENTRYPOINT //////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

// set ENTRYPOINT and ARGV0 here because
// they can be altered during process run
var ARGV0 = process.argv[0];
var EXECPATH = process.execPath;
var ENTRYPOINT = process.argv[1];

if (process.env.PKG_EXECPATH === 'PKG_INVOKE_NODEJS') {
  return { undoPatch: true };
}

if (NODE_VERSION_MAJOR < 12 || require('worker_threads').isMainThread) {
  if (process.argv[1] !== 'PKG_DUMMY_ENTRYPOINT') {
    // expand once patchless is introduced, that
    // will obviously lack any work in node_main.cc
    throw new Error('PKG_DUMMY_ENTRYPOINT EXPECTED');
  }
}

if (process.env.PKG_EXECPATH === EXECPATH) {
  process.argv.splice(1, 1);

  if (process.argv[1] && process.argv[1] !== '-') {
    // https://github.com/nodejs/node/blob/1a96d83a223ff9f05f7d942fb84440d323f7b596/lib/internal/bootstrap/node.js#L269
    process.argv[1] = require('path').resolve(process.argv[1]);
  }
} else {
  process.argv[1] = DEFAULT_ENTRYPOINT;
}

[, ENTRYPOINT] = process.argv;
delete process.env.PKG_EXECPATH;

// /////////////////////////////////////////////////////////////////
// EXECSTAT ////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

var EXECSTAT = require('fs').statSync(EXECPATH);

EXECSTAT.atimeMs = EXECSTAT.atime.getTime();
EXECSTAT.mtimeMs = EXECSTAT.mtime.getTime();
EXECSTAT.ctimeMs = EXECSTAT.ctime.getTime();
EXECSTAT.birthtimeMs = EXECSTAT.birthtime.getTime();

// /////////////////////////////////////////////////////////////////
// MOUNTPOINTS /////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

var mountpoints = [];

function insideMountpoint(f) {
  if (!insideSnapshot(f)) return null;
  var file = normalizePath(f);
  var found = mountpoints
    .map((mountpoint) => {
      var { interior } = mountpoint;
      var { exterior } = mountpoint;
      if (interior === file) return exterior;
      var left = interior + require('path').sep;
      if (file.slice(0, left.length) !== left) return null;
      return exterior + file.slice(left.length - 1);
    })
    .filter((result) => result);
  if (found.length >= 2) throw new Error('UNEXPECTED-00');
  if (found.length === 0) return null;
  return found[0];
}

function readdirMountpoints(path) {
  return mountpoints
    .map((mountpoint) => mountpoint.interior)
    .filter((interior) => require('path').dirname(interior) === path)
    .map((interior) => require('path').basename(interior));
}

function translate(f) {
  var result = insideMountpoint(f);
  if (!result) throw new Error('UNEXPECTED-05');
  return result;
}

function cloneArgs(args_) {
  return Array.prototype.slice.call(args_);
}

function translateNth(args_, index, f) {
  var args = cloneArgs(args_);
  args[index] = translate(f);
  return args;
}

function createMountpoint(interior, exterior) {
  // TODO validate
  mountpoints.push({ interior, exterior });
}

/*

// TODO move to some test

createMountpoint("d:\\snapshot\\countly\\plugins-ext", "d:\\deploy\\countly\\v16.02\\plugins-ext");

console.log(insideMountpoint("d:\\snapshot"));
console.log(insideMountpoint("d:\\snapshot\\"));
console.log(insideMountpoint("d:\\snapshot\\countly"));
console.log(insideMountpoint("d:\\snapshot\\countly\\"));
console.log(insideMountpoint("d:\\snapshot\\countly\\plugins-ext"));
console.log(insideMountpoint("d:\\snapshot\\countly\\plugins-ext\\"));
console.log(insideMountpoint("d:\\snapshot\\countly\\plugins-ext\\1234"));

console.log(translate("d:\\snapshot\\countly\\plugins-ext"));
console.log(translate("d:\\snapshot\\countly\\plugins-ext\\"));
console.log(translate("d:\\snapshot\\countly\\plugins-ext\\1234"));

console.log(translateNth([], 0, "d:\\snapshot\\countly\\plugins-ext"));
console.log(translateNth([], 0, "d:\\snapshot\\countly\\plugins-ext\\"));
console.log(translateNth([], 0, "d:\\snapshot\\countly\\plugins-ext\\1234"));

console.log(translateNth(["", "r+"], 0, "d:\\snapshot\\countly\\plugins-ext"));
console.log(translateNth(["", "rw"], 0, "d:\\snapshot\\countly\\plugins-ext\\"));
console.log(translateNth(["", "a+"], 0, "d:\\snapshot\\countly\\plugins-ext\\1234"));
*/

// /////////////////////////////////////////////////////////////////
// PROJECT /////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

function projectToFilesystem(f) {
  var xpdn = require('path').dirname(EXECPATH);

  var relatives = [];
  relatives.push(
    removeUplevels(
      require('path').relative(require('path').dirname(DEFAULT_ENTRYPOINT), f)
    )
  );

  if (relatives[0].slice(0, 'node_modules'.length) === 'node_modules') {
    // one more relative without starting 'node_modules'
    relatives.push(relatives[0].slice('node_modules'.length + 1));
  }

  var uplevels = [];
  var maxUplevels = xpdn.split(require('path').sep).length;
  for (var i = 0, u = ''; i < maxUplevels; i += 1) {
    uplevels.push(u);
    u += '/..';
  }

  var results = [];
  uplevels.forEach((uplevel) => {
    relatives.forEach((relative) => {
      results.push(require('path').join(xpdn, uplevel, relative));
    });
  });
  return results;
}

function projectToNearby(f) {
  return require('path').join(
    require('path').dirname(EXECPATH),
    require('path').basename(f)
  );
}

function findNativeAddonSyncFreeFromRequire(path) {
  if (!insideSnapshot(path)) throw new Error('UNEXPECTED-10');
  if (path.slice(-5) !== '.node') return null; // leveldown.node.js
  // check mearby first to prevent .node tampering
  var projector = projectToNearby(path);
  if (require('fs').existsSync(projector)) return projector;
  var projectors = projectToFilesystem(path);
  for (var i = 0; i < projectors.length; i += 1) {
    if (require('fs').existsSync(projectors[i])) return projectors[i];
  }
  return null;
}

function findNativeAddonSyncUnderRequire(path) {
  if (!FLAG_ENABLE_PROJECT) return null;
  return findNativeAddonSyncFreeFromRequire(path);
}

// /////////////////////////////////////////////////////////////////
// FLOW UTILS //////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

function asap(cb) {
  process.nextTick(cb);
}

function dezalgo(cb) {
  if (!cb) return cb;

  var sync = true;
  asap(() => {
    sync = false;
  });

  return function zalgoSafe() {
    var args = arguments;
    if (sync) {
      asap(() => {
        cb.apply(undefined, args);
      });
    } else {
      cb.apply(undefined, args);
    }
  };
}

function rethrow(error, arg) {
  if (error) throw error;
  return arg;
}

// /////////////////////////////////////////////////////////////////
// PAYLOAD /////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

if (typeof PAYLOAD_POSITION !== 'number' || typeof PAYLOAD_SIZE !== 'number') {
  throw new Error('MUST HAVE PAYLOAD');
}

function readPayload(buffer, offset, length, position, callback) {
  require('fs').read(
    EXECPATH_FD,
    buffer,
    offset,
    length,
    PAYLOAD_POSITION + position,
    callback
  );
}

function readPayloadSync(buffer, offset, length, position) {
  return require('fs').readSync(
    EXECPATH_FD,
    buffer,
    offset,
    length,
    PAYLOAD_POSITION + position
  );
}

function payloadCopyUni(
  source,
  target,
  targetStart,
  sourceStart,
  sourceEnd,
  cb
) {
  var cb2 = cb || rethrow;
  if (sourceStart >= source[1]) return cb2(null, 0);
  if (sourceEnd >= source[1]) [, sourceEnd] = source;
  var payloadPos = source[0] + sourceStart;
  var targetPos = targetStart;
  var targetEnd = targetStart + sourceEnd - sourceStart;
  if (cb) {
    readPayload(target, targetPos, targetEnd - targetPos, payloadPos, cb);
  } else {
    return readPayloadSync(
      target,
      targetPos,
      targetEnd - targetPos,
      payloadPos
    );
  }
}

function payloadCopyMany(source, target, targetStart, sourceStart, cb) {
  var payloadPos = source[0] + sourceStart;
  var targetPos = targetStart;
  var targetEnd = targetStart + source[1] - sourceStart;
  readPayload(
    target,
    targetPos,
    targetEnd - targetPos,
    payloadPos,
    (error, chunkSize) => {
      if (error) return cb(error);
      sourceStart += chunkSize;
      targetPos += chunkSize;
      if (chunkSize !== 0 && targetPos < targetEnd) {
        payloadCopyMany(source, target, targetPos, sourceStart, cb);
      } else {
        return cb();
      }
    }
  );
}

function payloadCopyManySync(source, target, targetStart, sourceStart) {
  var payloadPos = source[0] + sourceStart;
  var targetPos = targetStart;
  var targetEnd = targetStart + source[1] - sourceStart;
  var chunkSize;
  while (true) {
    chunkSize = readPayloadSync(
      target,
      targetPos,
      targetEnd - targetPos,
      payloadPos
    );
    payloadPos += chunkSize;
    targetPos += chunkSize;
    if (!(chunkSize !== 0 && targetPos < targetEnd)) break;
  }
}

function payloadFile(pointer, cb) {
  var target = Buffer.alloc(pointer[1]);
  payloadCopyMany(pointer, target, 0, 0, (error) => {
    if (error) return cb(error);
    cb(null, target);
  });
}

function payloadFileSync(pointer) {
  var target = Buffer.alloc(pointer[1]);
  payloadCopyManySync(pointer, target, 0, 0);
  return target;
}

// /////////////////////////////////////////////////////////////////
// SETUP PROCESS ///////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(() => {
  process.pkg = {};
  process.versions.pkg = '%VERSION%';
  process.pkg.mount = createMountpoint;
  process.pkg.entrypoint = ENTRYPOINT;
  process.pkg.defaultEntrypoint = DEFAULT_ENTRYPOINT;
})();

// /////////////////////////////////////////////////////////////////
// PATH.RESOLVE REPLACEMENT ////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
(() => {
  var path = require('path');

  process.pkg.path = {};
  process.pkg.path.resolve = function resolve() {
    var args = cloneArgs(arguments);
    args.unshift(path.dirname(ENTRYPOINT));
    return path.resolve.apply(path, args); // eslint-disable-line prefer-spread
  };
})();

// /////////////////////////////////////////////////////////////////
// PATCH FS ////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
(() => {
  var fs = require('fs');
  var ancestor = {};
  ancestor.openSync = fs.openSync;
  ancestor.open = fs.open;
  ancestor.readSync = fs.readSync;
  ancestor.read = fs.read;
  ancestor.writeSync = fs.writeSync;
  ancestor.write = fs.write;
  ancestor.closeSync = fs.closeSync;
  ancestor.close = fs.close;
  ancestor.readFileSync = fs.readFileSync;
  ancestor.readFile = fs.readFile;
  // ancestor.writeFileSync = fs.writeFileSync; // based on openSync/writeSync/closeSync
  // ancestor.writeFile =     fs.writeFile; // based on open/write/close
  ancestor.readdirSync = fs.readdirSync;
  ancestor.readdir = fs.readdir;
  ancestor.realpathSync = fs.realpathSync;
  ancestor.realpath = fs.realpath;
  ancestor.statSync = fs.statSync;
  ancestor.stat = fs.stat;
  ancestor.lstatSync = fs.lstatSync;
  ancestor.lstat = fs.lstat;
  ancestor.fstatSync = fs.fstatSync;
  ancestor.fstat = fs.fstat;
  ancestor.existsSync = fs.existsSync;
  ancestor.exists = fs.exists;
  ancestor.accessSync = fs.accessSync;
  ancestor.access = fs.access;

  var windows = process.platform === 'win32';

  var docks = {};
  var ENOTDIR = windows ? 4052 : 20;
  var ENOENT = windows ? 4058 : 2;
  var EISDIR = windows ? 4068 : 21;

  function assertEncoding(encoding) {
    if (encoding && !Buffer.isEncoding(encoding)) {
      throw new Error(`Unknown encoding: ${encoding}`);
    }
  }

  function maybeCallback(args) {
    var cb = args[args.length - 1];
    return typeof cb === 'function' ? cb : rethrow;
  }

  function error_ENOENT(fileOrDirectory, path) {
    // eslint-disable-line camelcase
    var error = new Error(
      `${fileOrDirectory} '${stripSnapshot(path)}' ` +
        `was not included into executable at compilation stage. ` +
        `Please recompile adding it as asset or script.`
    );
    error.errno = -ENOENT;
    error.code = 'ENOENT';
    error.path = path;
    error.pkg = true;
    return error;
  }

  function error_EISDIR(path) {
    // eslint-disable-line camelcase
    var error = new Error('EISDIR: illegal operation on a directory, read');
    error.errno = -EISDIR;
    error.code = 'EISDIR';
    error.path = path;
    error.pkg = true;
    return error;
  }

  function error_ENOTDIR(path) {
    // eslint-disable-line camelcase
    var error = new Error(`ENOTDIR: not a directory, scandir '${path}'`);
    error.errno = -ENOTDIR;
    error.code = 'ENOTDIR';
    error.path = path;
    error.pkg = true;
    return error;
  }

  // ///////////////////////////////////////////////////////////////
  // open //////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function openFromSnapshot(path_, cb) {
    var cb2 = cb || rethrow;
    var path = normalizePath(path_);
    // console.log("openFromSnapshot", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return cb2(error_ENOENT('File or directory', path));
    var dock = { path, entity, position: 0 };
    var nullDevice = windows ? '\\\\.\\NUL' : '/dev/null';
    if (cb) {
      ancestor.open.call(fs, nullDevice, 'r', (error, fd) => {
        if (error) return cb(error);
        docks[fd] = dock;
        cb(null, fd);
      });
    } else {
      var fd = ancestor.openSync.call(fs, nullDevice, 'r');
      docks[fd] = dock;
      return fd;
    }
  }

  fs.openSync = function openSync(path) {
    if (!insideSnapshot(path)) {
      return ancestor.openSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.openSync.apply(fs, translateNth(arguments, 0, path));
    }

    return openFromSnapshot(path);
  };

  fs.open = function open(path) {
    if (!insideSnapshot(path)) {
      return ancestor.open.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.open.apply(fs, translateNth(arguments, 0, path));
    }

    var callback = dezalgo(maybeCallback(arguments));
    openFromSnapshot(path, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // read //////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function readFromSnapshotSub(
    entityContent,
    dock,
    buffer,
    offset,
    length,
    position,
    cb
  ) {
    var p;
    if (position !== null && position !== undefined) {
      p = position;
    } else {
      p = dock.position;
    }
    if (cb) {
      payloadCopyUni(
        entityContent,
        buffer,
        offset,
        p,
        p + length,
        (error, bytesRead, buffer2) => {
          if (error) return cb(error);
          dock.position = p + bytesRead;
          cb(null, bytesRead, buffer2);
        }
      );
    } else {
      var bytesRead = payloadCopyUni(
        entityContent,
        buffer,
        offset,
        p,
        p + length
      );
      dock.position = p + bytesRead;
      return bytesRead;
    }
  }

  function readFromSnapshot(fd, buffer, offset, length, position, cb) {
    var cb2 = cb || rethrow;
    if (offset < 0 && NODE_VERSION_MAJOR >= 14)
      return cb2(
        new Error(
          `The value of "offset" is out of range. It must be >= 0. Received ${offset}`
        )
      );
    if (offset < 0 && NODE_VERSION_MAJOR >= 10)
      return cb2(
        new Error(
          `The value of "offset" is out of range. It must be >= 0 && <= ${buffer.length.toString()}. Received ${offset}`
        )
      );
    if (offset < 0) return cb2(new Error('Offset is out of bounds'));
    if (offset >= buffer.length && NODE_VERSION_MAJOR >= 6) return cb2(null, 0);
    if (offset >= buffer.length)
      return cb2(new Error('Offset is out of bounds'));
    if (offset + length > buffer.length && NODE_VERSION_MAJOR >= 14)
      return cb2(
        new Error(
          `The value of "length" is out of range. It must be <= ${(
            buffer.length - offset
          ).toString()}. Received ${length.toString()}`
        )
      );
    if (offset + length > buffer.length && NODE_VERSION_MAJOR >= 10)
      return cb2(
        new Error(
          `The value of "length" is out of range. It must be >= 0 && <= ${(
            buffer.length - offset
          ).toString()}. Received ${length.toString()}`
        )
      );
    if (offset + length > buffer.length)
      return cb2(new Error('Length extends beyond buffer'));

    var dock = docks[fd];
    var { entity } = dock;
    var entityLinks = entity[STORE_LINKS];
    if (entityLinks) return cb2(error_EISDIR(dock.path));
    var entityContent = entity[STORE_CONTENT];
    if (entityContent)
      return readFromSnapshotSub(
        entityContent,
        dock,
        buffer,
        offset,
        length,
        position,
        cb
      );
    return cb2(new Error('UNEXPECTED-15'));
  }

  fs.readSync = function readSync(fd, buffer, offset, length, position) {
    if (!docks[fd]) {
      return ancestor.readSync.apply(fs, arguments);
    }

    return readFromSnapshot(fd, buffer, offset, length, position);
  };

  fs.read = function read(fd, buffer, offset, length, position) {
    if (!docks[fd]) {
      return ancestor.read.apply(fs, arguments);
    }

    var callback = dezalgo(maybeCallback(arguments));
    readFromSnapshot(fd, buffer, offset, length, position, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // write /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function writeToSnapshot(cb) {
    var cb2 = cb || rethrow;
    return cb2(new Error('Cannot write to packaged file'));
  }

  fs.writeSync = function writeSync(fd) {
    if (!docks[fd]) {
      return ancestor.writeSync.apply(fs, arguments);
    }

    return writeToSnapshot();
  };

  fs.write = function write(fd) {
    if (!docks[fd]) {
      return ancestor.write.apply(fs, arguments);
    }

    var callback = dezalgo(maybeCallback(arguments));
    writeToSnapshot(callback);
  };

  // ///////////////////////////////////////////////////////////////
  // close /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function closeFromSnapshot(fd, cb) {
    delete docks[fd];
    if (cb) {
      ancestor.close.call(fs, fd, cb);
    } else {
      return ancestor.closeSync.call(fs, fd);
    }
  }

  fs.closeSync = function closeSync(fd) {
    if (!docks[fd]) {
      return ancestor.closeSync.apply(fs, arguments);
    }

    return closeFromSnapshot(fd);
  };

  fs.close = function close(fd) {
    if (!docks[fd]) {
      return ancestor.close.apply(fs, arguments);
    }

    var callback = dezalgo(maybeCallback(arguments));
    closeFromSnapshot(fd, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // readFile //////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function readFileOptions(options, hasCallback) {
    if (!options || (hasCallback && typeof options === 'function')) {
      return { encoding: null, flag: 'r' };
    }
    if (typeof options === 'string') {
      return { encoding: options, flag: 'r' };
    }
    if (typeof options === 'object') {
      return options;
    }
    return null;
  }

  function readFileFromSnapshotSub(entityContent, cb) {
    if (cb) {
      payloadFile(entityContent, cb);
    } else {
      return payloadFileSync(entityContent);
    }
  }

  function readFileFromSnapshot(path_, cb) {
    var cb2 = cb || rethrow;
    var path = normalizePath(path_);
    // console.log("readFileFromSnapshot", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return cb2(error_ENOENT('File', path));
    var entityLinks = entity[STORE_LINKS];
    if (entityLinks) return cb2(error_EISDIR(path));
    var entityContent = entity[STORE_CONTENT];
    if (entityContent) return readFileFromSnapshotSub(entityContent, cb);
    var entityBlob = entity[STORE_BLOB];
    if (entityBlob) return cb2(null, Buffer.from('source-code-not-available'));

    // why return empty buffer?
    // otherwise this error will arise:
    // Error: UNEXPECTED-20
    //     at readFileFromSnapshot (e:0)
    //     at Object.fs.readFileSync (e:0)
    //     at Object.Module._extensions..js (module.js:421:20)
    //     at Module.load (module.js:357:32)
    //     at Function.Module._load (module.js:314:12)
    //     at Function.Module.runMain (e:0)
    //     at startup (node.js:140:18)
    //     at node.js:1001:3

    return cb2(new Error('UNEXPECTED-20'));
  }

  fs.readFileSync = function readFileSync(path, options_) {
    if (path === 'dirty-hack-for-testing-purposes') {
      return path;
    }

    if (!insideSnapshot(path)) {
      return ancestor.readFileSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.readFileSync.apply(fs, translateNth(arguments, 0, path));
    }

    var options = readFileOptions(options_, false);

    if (!options) {
      return ancestor.readFileSync.apply(fs, arguments);
    }

    var { encoding } = options;
    assertEncoding(encoding);

    var buffer = readFileFromSnapshot(path);
    if (encoding) buffer = buffer.toString(encoding);
    return buffer;
  };

  fs.readFile = function readFile(path, options_) {
    if (!insideSnapshot(path)) {
      return ancestor.readFile.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.readFile.apply(fs, translateNth(arguments, 0, path));
    }

    var options = readFileOptions(options_, true);

    if (!options) {
      return ancestor.readFile.apply(fs, arguments);
    }

    var { encoding } = options;
    assertEncoding(encoding);

    var callback = dezalgo(maybeCallback(arguments));
    readFileFromSnapshot(path, (error, buffer) => {
      if (error) return callback(error);
      if (encoding) buffer = buffer.toString(encoding);
      callback(null, buffer);
    });
  };

  // ///////////////////////////////////////////////////////////////
  // writeFile /////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  // writeFileSync based on openSync/writeSync/closeSync
  // writeFile based on open/write/close

  // ///////////////////////////////////////////////////////////////
  // readdir ///////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function readdirOptions(options, hasCallback) {
    if (!options || (hasCallback && typeof options === 'function')) {
      return { encoding: null };
    }
    if (typeof options === 'string') {
      return { encoding: options };
    }
    if (typeof options === 'object') {
      return options;
    }
    return null;
  }

  function Dirent(name, type) {
    this.name = name;
    this.type = type;
  }

  Dirent.prototype.isDirectory = function isDirectory() {
    return this.type === 2;
  };

  Dirent.prototype.isFile = function isFile() {
    return this.type === 1;
  };

  Dirent.prototype.isSocket = function isSocket() {
    return false;
  };
  Dirent.prototype.isFIFO = Dirent.prototype.isSocket;
  Dirent.prototype.isSymbolicLink = Dirent.prototype.isSocket;
  Dirent.prototype.isCharacterDevice = Dirent.prototype.isSocket;
  Dirent.prototype.isBlockDevice = Dirent.prototype.isSocket;

  function getFileTypes(path_, entries) {
    return entries.map((entry) => {
      var path = require('path').join(path_, entry);
      var entity = VIRTUAL_FILESYSTEM[path];
      if (entity[STORE_BLOB] || entity[STORE_CONTENT])
        return new Dirent(entry, 1);
      if (entity[STORE_LINKS]) return new Dirent(entry, 2);
      throw new Error('UNEXPECTED-24');
    });
  }

  function readdirRoot(path, cb) {
    if (cb) {
      ancestor.readdir(path, (error, entries) => {
        if (error) return cb(error);
        entries.push('snapshot');
        cb(null, entries);
      });
    } else {
      var entries = ancestor.readdirSync(path);
      entries.push('snapshot');
      return entries;
    }
  }

  function readdirFromSnapshotSub(entityLinks, path, cb) {
    if (cb) {
      payloadFile(entityLinks, (error, buffer) => {
        if (error) return cb(error);
        cb(null, JSON.parse(buffer).concat(readdirMountpoints(path)));
      });
    } else {
      var buffer = payloadFileSync(entityLinks);
      return JSON.parse(buffer).concat(readdirMountpoints(path));
    }
  }

  function readdirFromSnapshot(path_, isRoot, cb) {
    var cb2 = cb || rethrow;
    if (isRoot) return readdirRoot(path_, cb);
    var path = normalizePath(path_);
    // console.log("readdirFromSnapshot", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return cb2(error_ENOENT('Directory', path));
    var entityBlob = entity[STORE_BLOB];
    if (entityBlob) return cb2(error_ENOTDIR(path));
    var entityContent = entity[STORE_CONTENT];
    if (entityContent) return cb2(error_ENOTDIR(path));
    var entityLinks = entity[STORE_LINKS];
    if (entityLinks) return readdirFromSnapshotSub(entityLinks, path, cb);
    return cb2(new Error('UNEXPECTED-25'));
  }

  fs.readdirSync = function readdirSync(path, options_) {
    var isRoot = isRootPath(path);

    if (!insideSnapshot(path) && !isRoot) {
      return ancestor.readdirSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.readdirSync.apply(fs, translateNth(arguments, 0, path));
    }

    var options = readdirOptions(options_, false);

    if (!options || options.withFileTypes) {
      return ancestor.readdirSync.apply(fs, arguments);
    }

    var entries = readdirFromSnapshot(path, isRoot);
    if (options.withFileTypes) entries = getFileTypes(path, entries);
    return entries;
  };

  fs.readdir = function readdir(path, options_) {
    var isRoot = isRootPath(path);

    if (!insideSnapshot(path) && !isRoot) {
      return ancestor.readdir.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.readdir.apply(fs, translateNth(arguments, 0, path));
    }

    var options = readdirOptions(options_, true);

    if (!options || options.withFileTypes) {
      return ancestor.readdir.apply(fs, arguments);
    }

    var callback = dezalgo(maybeCallback(arguments));
    readdirFromSnapshot(path, isRoot, (error, entries) => {
      if (error) return callback(error);
      if (options.withFileTypes) entries = getFileTypes(path, entries);
      callback(null, entries);
    });
  };

  // ///////////////////////////////////////////////////////////////
  // realpath //////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function realpathFromSnapshot(path_) {
    var path = normalizePath(path_);
    // console.log("realpathFromSnapshot", path);
    return path;
  }

  fs.realpathSync = function realpathSync(path) {
    if (!insideSnapshot(path)) {
      return ancestor.realpathSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      // app should not know real file name
    }

    return realpathFromSnapshot(path);
  };

  fs.realpath = function realpath(path) {
    if (!insideSnapshot(path)) {
      return ancestor.realpath.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      // app should not know real file name
    }

    var callback = dezalgo(maybeCallback(arguments));
    callback(null, realpathFromSnapshot(path));
  };

  // ///////////////////////////////////////////////////////////////
  // stat //////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function restore(s) {
    s.blksize = 4096;
    s.blocks = 0;
    s.dev = 0;
    s.gid = 20;
    s.ino = 0;
    s.nlink = 0;
    s.rdev = 0;
    s.uid = 500;

    s.atime = new Date(EXECSTAT.atime);
    s.mtime = new Date(EXECSTAT.mtime);
    s.ctime = new Date(EXECSTAT.ctime);
    s.birthtime = new Date(EXECSTAT.birthtime);

    s.atimeMs = EXECSTAT.atimeMs;
    s.mtimeMs = EXECSTAT.mtimeMs;
    s.ctimeMs = EXECSTAT.ctimeMs;
    s.birthtimeMs = EXECSTAT.birthtimeMs;

    var { isFileValue } = s;
    var { isDirectoryValue } = s;
    var { isSocketValue } = s;
    delete s.isFileValue;
    delete s.isDirectoryValue;
    delete s.isSocketValue;

    s.isFile = function isFile() {
      return isFileValue;
    };
    s.isDirectory = function isDirectory() {
      return isDirectoryValue;
    };
    s.isSocket = function isSocket() {
      return isSocketValue;
    };
    s.isSymbolicLink = function isSymbolicLink() {
      return false;
    };
    s.isFIFO = function isFIFO() {
      return false;
    };

    return s;
  }

  function findNativeAddonForStat(path, cb) {
    var cb2 = cb || rethrow;
    var foundPath = findNativeAddonSyncUnderRequire(path);
    if (!foundPath) return cb2(error_ENOENT('File or directory', path));
    if (cb) {
      ancestor.stat.call(fs, foundPath, cb);
    } else {
      return ancestor.statSync.call(fs, foundPath);
    }
  }

  function statFromSnapshotSub(entityStat, cb) {
    if (cb) {
      payloadFile(entityStat, (error, buffer) => {
        if (error) return cb(error);
        cb(null, restore(JSON.parse(buffer)));
      });
    } else {
      var buffer = payloadFileSync(entityStat);
      return restore(JSON.parse(buffer));
    }
  }

  function statFromSnapshot(path_, cb) {
    var cb2 = cb || rethrow;
    var path = normalizePath(path_);
    // console.log("statFromSnapshot", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return findNativeAddonForStat(path, cb);
    var entityStat = entity[STORE_STAT];
    if (entityStat) return statFromSnapshotSub(entityStat, cb);
    return cb2(new Error('UNEXPECTED-35'));
  }

  fs.statSync = function statSync(path) {
    if (!insideSnapshot(path)) {
      return ancestor.statSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.statSync.apply(fs, translateNth(arguments, 0, path));
    }

    return statFromSnapshot(path);
  };

  fs.stat = function stat(path) {
    if (!insideSnapshot(path)) {
      return ancestor.stat.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.stat.apply(fs, translateNth(arguments, 0, path));
    }

    var callback = dezalgo(maybeCallback(arguments));
    statFromSnapshot(path, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // lstat /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  fs.lstatSync = function lstatSync(path) {
    if (!insideSnapshot(path)) {
      return ancestor.lstatSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.lstatSync.apply(fs, translateNth(arguments, 0, path));
    }

    return statFromSnapshot(path);
  };

  fs.lstat = function lstat(path) {
    if (!insideSnapshot(path)) {
      return ancestor.lstat.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.lstat.apply(fs, translateNth(arguments, 0, path));
    }

    var callback = dezalgo(maybeCallback(arguments));
    statFromSnapshot(path, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // fstat /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function fstatFromSnapshot(fd, cb) {
    var cb2 = cb || rethrow;
    var { entity } = docks[fd];
    var entityStat = entity[STORE_STAT];
    if (entityStat) return statFromSnapshotSub(entityStat, cb);
    return cb2(new Error('UNEXPECTED-40'));
  }

  fs.fstatSync = function fstatSync(fd) {
    if (!docks[fd]) {
      return ancestor.fstatSync.apply(fs, arguments);
    }

    return fstatFromSnapshot(fd);
  };

  fs.fstat = function fstat(fd) {
    if (!docks[fd]) {
      return ancestor.fstat.apply(fs, arguments);
    }

    var callback = dezalgo(maybeCallback(arguments));
    fstatFromSnapshot(fd, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // exists ////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function findNativeAddonForExists(path) {
    var foundPath = findNativeAddonSyncFreeFromRequire(path);
    if (!foundPath) return false;
    return ancestor.existsSync.call(fs, foundPath);
  }

  function existsFromSnapshot(path_) {
    var path = normalizePath(path_);
    // console.log("existsFromSnapshot", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return findNativeAddonForExists(path);
    return true;
  }

  fs.existsSync = function existsSync(path) {
    if (!insideSnapshot(path)) {
      return ancestor.existsSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.existsSync.apply(fs, translateNth(arguments, 0, path));
    }

    return existsFromSnapshot(path);
  };

  fs.exists = function exists(path) {
    if (!insideSnapshot(path)) {
      return ancestor.exists.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.exists.apply(fs, translateNth(arguments, 0, path));
    }

    var callback = dezalgo(maybeCallback(arguments));
    callback(existsFromSnapshot(path));
  };

  // ///////////////////////////////////////////////////////////////
  // access ////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function accessFromSnapshot(path_, cb) {
    var cb2 = cb || rethrow;
    var path = normalizePath(path_);
    // console.log("accessFromSnapshot", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return cb2(error_ENOENT('File or directory', path));
    return cb2(null, undefined);
  }

  fs.accessSync = function accessSync(path) {
    if (!insideSnapshot(path)) {
      return ancestor.accessSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.accessSync.apply(fs, translateNth(arguments, 0, path));
    }

    return accessFromSnapshot(path);
  };

  fs.access = function access(path) {
    if (!insideSnapshot(path)) {
      return ancestor.access.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.access.apply(fs, translateNth(arguments, 0, path));
    }

    var callback = dezalgo(maybeCallback(arguments));
    accessFromSnapshot(path, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // promises ////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  if (fs.promises !== undefined) {
    var util = require('util');
    fs.promises.open = util.promisify(fs.open);
    fs.promises.read = util.promisify(fs.read);
    fs.promises.write = util.promisify(fs.write);
    fs.promises.readFile = util.promisify(fs.readFile);
    fs.promises.readdir = util.promisify(fs.readdir);
    fs.promises.realpath = util.promisify(fs.realpath);
    fs.promises.stat = util.promisify(fs.stat);
    fs.promises.lstat = util.promisify(fs.lstat);
    fs.promises.fstat = util.promisify(fs.fstat);
    fs.promises.access = util.promisify(fs.access);
  }

  // ///////////////////////////////////////////////////////////////
  // INTERNAL //////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function makeLong(f) {
    return require('path')._makeLong(f);
  }

  function revertMakingLong(f) {
    if (/^\\\\\?\\/.test(f)) return f.slice(4);
    return f;
  }

  function findNativeAddonForInternalModuleStat(path_) {
    var path = findNativeAddonSyncUnderRequire(path_);
    if (!path) return -ENOENT;
    return process.binding('fs').internalModuleStat(makeLong(path));
  }

  fs.internalModuleStat = function internalModuleStat(long) {
    // from node comments:
    // Used to speed up module loading. Returns 0 if the path refers to
    // a file, 1 when it's a directory or < 0 on error (usually -ENOENT).
    // The speedup comes from not creating thousands of Stat and Error objects.

    var path = revertMakingLong(long);

    if (!insideSnapshot(path)) {
      return process.binding('fs').internalModuleStat(long);
    }
    if (insideMountpoint(path)) {
      return process
        .binding('fs')
        .internalModuleStat(makeLong(translate(path)));
    }

    path = normalizePath(path);
    // console.log("internalModuleStat", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return findNativeAddonForInternalModuleStat(path);
    var entityBlob = entity[STORE_BLOB];
    if (entityBlob) return 0;
    var entityContent = entity[STORE_CONTENT];
    if (entityContent) return 0;
    var entityLinks = entity[STORE_LINKS];
    if (entityLinks) return 1;
    return -ENOENT;
  };

  fs.internalModuleReadJSON = function internalModuleReadJSON(long) {
    // from node comments:
    // Used to speed up module loading. Returns the contents of the file as
    // a string or undefined when the file cannot be opened. The speedup
    // comes from not creating Error objects on failure.
    // For newer node versions (after https://github.com/nodejs/node/pull/33229 ):
    // Returns an array [string, boolean].
    //
    var returnArray =
      (NODE_VERSION_MAJOR === 12 && NODE_VERSION_MINOR >= 19) ||
      (NODE_VERSION_MAJOR === 14 && NODE_VERSION_MINOR >= 5) ||
      NODE_VERSION_MAJOR >= 15;

    var path = revertMakingLong(long);
    var bindingFs = process.binding('fs');
    var readFile = (
      bindingFs.internalModuleReadFile || bindingFs.internalModuleReadJSON
    ).bind(bindingFs);
    if (!insideSnapshot(path)) {
      return readFile(long);
    }
    if (insideMountpoint(path)) {
      return readFile(makeLong(translate(path)));
    }

    path = normalizePath(path);
    // console.log("internalModuleReadFile", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return returnArray ? [undefined, false] : undefined;
    var entityContent = entity[STORE_CONTENT];
    if (!entityContent) return returnArray ? [undefined, false] : undefined;
    return returnArray
      ? [payloadFileSync(entityContent).toString(), true]
      : payloadFileSync(entityContent).toString();
  };

  fs.internalModuleReadFile = fs.internalModuleReadJSON;
})();

// /////////////////////////////////////////////////////////////////
// PATCH MODULE ////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
(() => {
  var Module = require('module');
  var ancestor = {};
  ancestor.require = Module.prototype.require;
  ancestor._compile = Module.prototype._compile;
  ancestor._resolveFilename = Module._resolveFilename;
  ancestor.runMain = Module.runMain;

  Module.prototype.require = function require(path) {
    try {
      return ancestor.require.apply(this, arguments);
    } catch (error) {
      if (
        (error.code === 'ENOENT' || error.code === 'MODULE_NOT_FOUND') &&
        !insideSnapshot(path) &&
        !require('path').isAbsolute(path)
      ) {
        if (!error.pkg) {
          error.pkg = true;
          error.message +=
            '\n' +
            '1) If you want to compile the package/file into ' +
            'executable, please pay attention to compilation ' +
            "warnings and specify a literal in 'require' call. " +
            "2) If you don't want to compile the package/file " +
            "into executable and want to 'require' it from " +
            'filesystem (likely plugin), specify an absolute ' +
            "path in 'require' call using process.cwd() or " +
            'process.execPath.';
        }
      }
      throw error;
    }
  };

  var im;
  var makeRequireFunction;

  if (NODE_VERSION_MAJOR === 0) {
    makeRequireFunction = (self) => {
      function rqfn(path) {
        return self.require(path);
      }
      rqfn.resolve = function resolve(request) {
        return Module._resolveFilename(request, self);
      };
      rqfn.main = process.mainModule;
      rqfn.extensions = Module._extensions;
      rqfn.cache = Module._cache;
      return rqfn;
    };
  } else if (NODE_VERSION_MAJOR <= 9) {
    im = require('internal/module');
    if (NODE_VERSION_MAJOR <= 7) {
      makeRequireFunction = (m) => im.makeRequireFunction.call(m);
    } else {
      makeRequireFunction = im.makeRequireFunction;
    }
  } else {
    im = require('internal/modules/cjs/helpers');
    makeRequireFunction = im.makeRequireFunction;
    // TODO esm modules along with cjs
  }

  Module.prototype._compile = function _compile(content, filename_) {
    if (!insideSnapshot(filename_)) {
      return ancestor._compile.apply(this, arguments);
    }
    if (insideMountpoint(filename_)) {
      // DONT TRANSLATE! otherwise __dirname gets real name
      return ancestor._compile.apply(this, arguments);
    }

    var filename = normalizePath(filename_);
    // console.log("_compile", filename);
    var entity = VIRTUAL_FILESYSTEM[filename];

    if (!entity) {
      // let user try to "_compile" a packaged file
      return ancestor._compile.apply(this, arguments);
    }

    var entityBlob = entity[STORE_BLOB];
    var entityContent = entity[STORE_CONTENT];

    if (entityBlob) {
      var options = {
        filename,
        lineOffset: 0,
        displayErrors: true,
        cachedData: payloadFileSync(entityBlob),
        sourceless: !entityContent,
      };

      var { Script } = require('vm');
      var code = entityContent
        ? require('module').wrap(payloadFileSync(entityContent))
        : undefined;

      var script = new Script(code, options);
      var wrapper = script.runInThisContext(options);
      if (!wrapper) process.exit(4); // for example VERSION_MISMATCH
      var dirname = require('path').dirname(filename);
      var rqfn = makeRequireFunction(this);
      var args = [this.exports, rqfn, this, filename, dirname];
      return wrapper.apply(this.exports, args);
    }

    if (entityContent) {
      if (entityBlob) throw new Error('UNEXPECTED-50');
      // content is already in utf8 and without BOM (that is expected
      // by stock _compile), but entityContent is still a Buffer
      return ancestor._compile.apply(this, arguments);
    }

    throw new Error('UNEXPECTED-55');
  };

  Module._resolveFilename = function _resolveFilename() {
    var filename;
    var flagWasOn = false;

    try {
      filename = ancestor._resolveFilename.apply(this, arguments);
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error;

      FLAG_ENABLE_PROJECT = true;
      var savePathCache = Module._pathCache;
      Module._pathCache = Object.create(null);
      try {
        filename = ancestor._resolveFilename.apply(this, arguments);
        flagWasOn = true;
      } finally {
        Module._pathCache = savePathCache;
        FLAG_ENABLE_PROJECT = false;
      }
    }

    if (!insideSnapshot(filename)) {
      return filename;
    }
    if (insideMountpoint(filename)) {
      return filename;
    }

    if (flagWasOn) {
      FLAG_ENABLE_PROJECT = true;
      try {
        var found = findNativeAddonSyncUnderRequire(filename);
        if (found) filename = found;
      } finally {
        FLAG_ENABLE_PROJECT = false;
      }
    }

    return filename;
  };

  Module.runMain = function runMain() {
    Module._load(ENTRYPOINT, null, true);
    process._tickCallback();
  };
})();

// /////////////////////////////////////////////////////////////////
// PATCH CHILD_PROCESS /////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
(() => {
  var childProcess = require('child_process');
  var ancestor = {};
  ancestor.spawn = childProcess.spawn;
  ancestor.spawnSync = childProcess.spawnSync;
  ancestor.execFile = childProcess.execFile;
  ancestor.execFileSync = childProcess.execFileSync;
  ancestor.exec = childProcess.exec;
  ancestor.execSync = childProcess.execSync;

  function setOptsEnv(args) {
    var pos = args.length - 1;
    if (typeof args[pos] === 'function') pos -= 1;
    if (typeof args[pos] !== 'object' || Array.isArray(args[pos])) {
      pos += 1;
      args.splice(pos, 0, {});
    }
    var opts = args[pos];
    if (!opts.env) opts.env = require('util')._extend({}, process.env);
    if (opts.env.PKG_EXECPATH === 'PKG_INVOKE_NODEJS') return;
    opts.env.PKG_EXECPATH = EXECPATH;
  }

  function startsWith2(args, index, name, impostor) {
    var qsName = `"${name} `;
    if (args[index].slice(0, qsName.length) === qsName) {
      args[index] = `"${impostor} ${args[index].slice(qsName.length)}`;
      return true;
    }
    var sName = `${name} `;
    if (args[index].slice(0, sName.length) === sName) {
      args[index] = `${impostor} ${args[index].slice(sName.length)}`;
      return true;
    }
    if (args[index] === name) {
      args[index] = impostor;
      return true;
    }
    return false;
  }

  function startsWith(args, index, name) {
    var qName = `"${name}"`;
    var qEXECPATH = `"${EXECPATH}"`;
    var jsName = JSON.stringify(name);
    var jsEXECPATH = JSON.stringify(EXECPATH);
    return (
      startsWith2(args, index, name, EXECPATH) ||
      startsWith2(args, index, qName, qEXECPATH) ||
      startsWith2(args, index, jsName, jsEXECPATH)
    );
  }

  function modifyLong(args, index) {
    if (!args[index]) return;
    return (
      startsWith(args, index, 'node') ||
      startsWith(args, index, ARGV0) ||
      startsWith(args, index, ENTRYPOINT) ||
      startsWith(args, index, EXECPATH)
    );
  }

  function modifyShort(args) {
    if (!args[0]) return;
    if (!Array.isArray(args[1])) {
      args.splice(1, 0, []);
    }
    if (
      args[0] === 'node' ||
      args[0] === ARGV0 ||
      args[0] === ENTRYPOINT ||
      args[0] === EXECPATH
    ) {
      args[0] = EXECPATH;
      if (NODE_VERSION_MAJOR === 0) {
        args[1] = args[1].filter((a) => a.slice(0, 13) !== '--debug-port=');
      }
    } else {
      for (var i = 1; i < args[1].length; i += 1) {
        var mbc = args[1][i - 1];
        if (mbc === '-c' || mbc === '/c') {
          modifyLong(args[1], i);
        }
      }
    }
  }

  childProcess.spawn = function spawn() {
    var args = cloneArgs(arguments);
    setOptsEnv(args);
    modifyShort(args);
    return ancestor.spawn.apply(childProcess, args);
  };

  childProcess.spawnSync = function spawnSync() {
    var args = cloneArgs(arguments);
    setOptsEnv(args);
    modifyShort(args);
    return ancestor.spawnSync.apply(childProcess, args);
  };

  childProcess.execFile = function execFile() {
    var args = cloneArgs(arguments);
    setOptsEnv(args);
    modifyShort(args);
    return ancestor.execFile.apply(childProcess, args);
  };

  childProcess.execFileSync = function execFileSync() {
    var args = cloneArgs(arguments);
    setOptsEnv(args);
    modifyShort(args);
    return ancestor.execFileSync.apply(childProcess, args);
  };

  childProcess.exec = function exec() {
    var args = cloneArgs(arguments);
    setOptsEnv(args);
    modifyLong(args, 0);
    return ancestor.exec.apply(childProcess, args);
  };

  childProcess.execSync = function execSync() {
    var args = cloneArgs(arguments);
    setOptsEnv(args);
    modifyLong(args, 0);
    return ancestor.execSync.apply(childProcess, args);
  };
})();

// /////////////////////////////////////////////////////////////////
// PROMISIFY ///////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
(() => {
  var util = require('util');
  var { promisify } = util;
  if (promisify) {
    var { custom } = promisify;
    var { customPromisifyArgs } = require('internal/util');

    // /////////////////////////////////////////////////////////////
    // FS //////////////////////////////////////////////////////////
    // /////////////////////////////////////////////////////////////

    Object.defineProperty(require('fs').exists, custom, {
      value(path) {
        return new Promise((resolve) => {
          require('fs').exists(path, (exists) => {
            resolve(exists);
          });
        });
      },
    });

    Object.defineProperty(require('fs').read, customPromisifyArgs, {
      value: ['bytesRead', 'buffer'],
    });

    Object.defineProperty(require('fs').write, customPromisifyArgs, {
      value: ['bytesWritten', 'buffer'],
    });

    // /////////////////////////////////////////////////////////////
    // CHILD_PROCESS ///////////////////////////////////////////////
    // /////////////////////////////////////////////////////////////

    var customPromiseExecFunction = (o) => (...args) => {
      let resolve;
      let reject;
      const p = new Promise((res, rej) => {
        resolve = res;
        reject  = rej;
      });

      p.child = o.apply(
        undefined,
        args.concat((error, stdout, stderr) => {
          if (error !== null) {
            error.stdout = stdout;
            error.stderr = stderr;
            reject(error);
          } else {
            resolve({ stdout, stderr });
          }
        })
      );

      return p;
    };

    Object.defineProperty(require('child_process').exec, custom, {
      value: customPromiseExecFunction(require('child_process').exec),
    });

    Object.defineProperty(require('child_process').execFile, custom, {
      value: customPromiseExecFunction(require('child_process').execFile),
    });
  }
})();

// /////////////////////////////////////////////////////////////////
// PATCH PROCESS ///////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
(() => {
  const fs = require('fs');
  var ancestor = {};
  ancestor.dlopen = process.dlopen;

  function revertMakingLong(f) {
    if (/^\\\\\?\\/.test(f)) return f.slice(4);
    return f;
  }

  process.dlopen = function dlopen() {
    const args = cloneArgs(arguments);
    const modulePath = revertMakingLong(args[1]);
    const moduleDirname = require('path').dirname(modulePath);
    if (insideSnapshot(modulePath)) {
      // Node addon files and .so cannot be read with fs directly, they are loaded with process.dlopen which needs a filesystem path
      // we need to write the file somewhere on disk first and then load it
      const moduleContent = fs.readFileSync(modulePath);
      const moduleBaseName = require('path').basename(modulePath);
      const hash = require('crypto')
        .createHash('sha256')
        .update(moduleContent)
        .digest('hex');
      const tmpModulePath = `${require('os').tmpdir()}/${hash}_${moduleBaseName}`;
      try {
        fs.statSync(tmpModulePath);
      } catch (e) {
        // Most likely this means the module is not on disk yet
        fs.writeFileSync(tmpModulePath, moduleContent, { mode: 0o444 });
      }
      args[1] = tmpModulePath;
    }

    const unknownModuleErrorRegex = /([^:]+): cannot open shared object file: No such file or directory/;
    const tryImporting = function tryImporting(previousErrorMessage) {
      try {
        const res = ancestor.dlopen.apply(process, args);
        return res;
      } catch (e) {
        if (e.message === previousErrorMessage) {
          // we already tried to fix this and it didn't work, give up
          throw e;
        }
        if (e.message.match(unknownModuleErrorRegex)) {
          // some modules are packaged with dynamic linking and needs to open other files that should be in
          // the same directory, in this case, we write this file in the same /tmp directory and try to
          // import the module again
          const moduleName = e.message.match(unknownModuleErrorRegex)[1];
          const importModulePath = `${moduleDirname}/${moduleName}`;
          const moduleContent = fs.readFileSync(importModulePath);
          const moduleBaseName = require('path').basename(importModulePath);
          const tmpModulePath = `${require('os').tmpdir()}/${moduleBaseName}`;
          try {
            fs.statSync(tmpModulePath);
          } catch (err) {
            fs.writeFileSync(tmpModulePath, moduleContent, { mode: 0o444 });
          }
          return tryImporting(e.message);
        }
        throw e;
      }
    };
    tryImporting();
  };
})();
