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
/* global DICT */
/* global DOCOMPRESS */
/* global SYMLINKS */

'use strict';

const fs = require('fs');
const path = require('path');
const { sep } = require('path');
const {
  gunzip,
  gunzipSync,
  brotliDecompressSync,
  brotliDecompress,
  createBrotliDecompress,
  createGunzip,
} = require('zlib');
const { createHash } = require('crypto');

const common = {};
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

let FLAG_ENABLE_PROJECT = false;
const NODE_VERSION_MAJOR = process.version.match(/^v(\d+)/)[1] | 0;
const NODE_VERSION_MINOR = process.version.match(/^v\d+.(\d+)/)[1] | 0;

// /////////////////////////////////////////////////////////////////
// ENTRYPOINT //////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

// set ENTRYPOINT and ARGV0 here because
// they can be altered during process run
const ARGV0 = process.argv[0];
const EXECPATH = process.execPath;
let ENTRYPOINT = process.argv[1];

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

const EXECSTAT = fs.statSync(EXECPATH);

EXECSTAT.atimeMs = EXECSTAT.atime.getTime();
EXECSTAT.mtimeMs = EXECSTAT.mtime.getTime();
EXECSTAT.ctimeMs = EXECSTAT.ctime.getTime();
EXECSTAT.birthtimeMs = EXECSTAT.birthtime.getTime();

// /////////////////////////////////////////////////////////////////
// MOUNTPOINTS /////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

const mountpoints = [];

function isRegExp(val) {
  return require('util').types.isRegExp(val);
}

function insideMountpoint(f) {
  if (!insideSnapshot(f)) return null;

  const file = normalizePath(f);
  const found = mountpoints
    .map((mountpoint) => {
      const { interior, exterior } = mountpoint;
      if (isRegExp(interior) && interior.test(file))
        return file.replace(interior, exterior);
      if (interior === file) return exterior;
      const left = interior + sep;
      if (file.slice(0, left.length) !== left) return null;
      return exterior + file.slice(left.length - 1);
    })
    .filter((result) => result);

  if (found.length >= 2) throw new Error('UNEXPECTED-00');
  if (found.length === 0) return null;
  return found[0];
}

function readdirMountpoints(filename) {
  return mountpoints
    .filter(({ interior }) => {
      if (isRegExp(interior)) return interior.test(filename);
      return path.dirname(interior) === filename;
    })
    .map(({ interior, exterior }) => {
      if (isRegExp(interior)) return path.replace(interior, exterior);
      return path.basename(interior);
    });
}

function translate(f) {
  const result = insideMountpoint(f);
  if (!result) throw new Error('UNEXPECTED-05');
  return result;
}

function cloneArgs(args_) {
  return Array.prototype.slice.call(args_);
}

function translateNth(args_, index, f) {
  const args = cloneArgs(args_);
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
const separator = '$';
function replace(k) {
  return DICT[k];
}
function makeKey(filename, slash) {
  const a = filename.split(slash).map(replace).join(separator);
  return a || filename;
}
const dictRev = {};
Object.entries(DICT).forEach(([k, v]) => {
  dictRev[v] = k;
});

function toOriginal(fShort) {
  return fShort
    .split('$')
    .map((x) => dictRev[x])
    .join(sep);
}

const symlinksEntries = Object.entries(SYMLINKS);
function normalizePathAndFollowLink(f) {
  f = normalizePath(f);
  f = makeKey(f, sep);
  let needToSubstitue = true;
  while (needToSubstitue) {
    needToSubstitue = false;
    for (const [k, v] of symlinksEntries) {
      if (f.startsWith(`${k}${separator}`) || f === k) {
        f = f.replace(k, v);
        needToSubstitue = true;
        break;
      }
    }
  }
  return f;
}
function realpathFromSnapshot(f) {
  const realPath = toOriginal(normalizePathAndFollowLink(f));
  return realPath;
}

function findVirtualFileSystemEntry(f) {
  const fShort = normalizePathAndFollowLink(f);
  return VIRTUAL_FILESYSTEM[fShort];
}

// /////////////////////////////////////////////////////////////////
// PROJECT /////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

const xpdn = path.dirname(EXECPATH);
const maxUplevels = xpdn.split(sep).length;
function projectToFilesystem(f) {
  const relatives = [];
  relatives.push(
    removeUplevels(path.relative(path.dirname(DEFAULT_ENTRYPOINT), f))
  );

  if (relatives[0].slice(0, 'node_modules'.length) === 'node_modules') {
    // one more relative without starting 'node_modules'
    relatives.push(relatives[0].slice('node_modules'.length + 1));
  }

  const uplevels = [];
  for (let i = 0, u = ''; i < maxUplevels; i += 1) {
    uplevels.push(u);
    u += '/..';
  }

  const results = [];
  uplevels.forEach((uplevel) => {
    relatives.forEach((relative) => {
      results.push(path.join(xpdn, uplevel, relative));
    });
  });
  return results;
}

function projectToNearby(f) {
  return path.join(xpdn, path.basename(f));
}
function findNativeAddonSyncFreeFromRequire(f) {
  if (!insideSnapshot(f)) throw new Error(`UNEXPECTED-10 ${f}`);
  if (f.slice(-5) !== '.node') return null; // leveldown.node.js
  // check mearby first to prevent .node tampering
  const projector = projectToNearby(f);
  if (fs.existsSync(projector)) return projector;
  const projectors = projectToFilesystem(f);
  for (let i = 0; i < projectors.length; i += 1) {
    if (fs.existsSync(projectors[i])) return projectors[i];
  }
  return null;
}

function findNativeAddonSyncUnderRequire(f) {
  if (!FLAG_ENABLE_PROJECT) return null;
  return findNativeAddonSyncFreeFromRequire(f);
}

// /////////////////////////////////////////////////////////////////
// FLOW UTILS //////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

function asap(cb) {
  process.nextTick(cb);
}

function dezalgo(cb) {
  if (!cb) return cb;

  let sync = true;
  asap(() => {
    sync = false;
  });

  return function zalgoSafe() {
    const args = arguments;
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
  fs.read(
    EXECPATH_FD,
    buffer,
    offset,
    length,
    PAYLOAD_POSITION + position,
    callback
  );
}

function readPayloadSync(buffer, offset, length, position) {
  return fs.readSync(
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
  const cb2 = cb || rethrow;
  if (sourceStart >= source[1]) return cb2(null, 0);
  if (sourceEnd >= source[1]) [, sourceEnd] = source;
  const payloadPos = source[0] + sourceStart;
  const targetPos = targetStart;
  const targetEnd = targetStart + sourceEnd - sourceStart;
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
  const payloadPos = source[0] + sourceStart;
  let targetPos = targetStart;
  const targetEnd = targetStart + source[1] - sourceStart;
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
  let payloadPos = source[0] + sourceStart;
  let targetPos = targetStart;
  const targetEnd = targetStart + source[1] - sourceStart;
  while (true) {
    const chunkSize = readPayloadSync(
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

const GZIP = 1;
const BROTLI = 2;
function payloadFile(pointer, cb) {
  const target = Buffer.alloc(pointer[1]);
  payloadCopyMany(pointer, target, 0, 0, (error) => {
    if (error) return cb(error);
    if (DOCOMPRESS === GZIP) {
      gunzip(target, (error2, target2) => {
        if (error2) return cb(error2);
        cb(null, target2);
      });
    } else if (DOCOMPRESS === BROTLI) {
      brotliDecompress(target, (error2, target2) => {
        if (error2) return cb(error2);
        cb(null, target2);
      });
    } else {
      return cb(null, target);
    }
  });
}

function payloadFileSync(pointer) {
  const target = Buffer.alloc(pointer[1]);
  payloadCopyManySync(pointer, target, 0, 0);
  if (DOCOMPRESS === GZIP) {
    const target1 = gunzipSync(target);
    return target1;
  }
  if (DOCOMPRESS === BROTLI) {
    const target1 = brotliDecompressSync(target);
    return target1;
  }
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
  process.pkg.path = {};
  process.pkg.path.resolve = () => {
    const args = cloneArgs(arguments);
    args.unshift(path.dirname(ENTRYPOINT));
    return path.resolve.apply(path, args); // eslint-disable-line prefer-spread
  };
})();

// /////////////////////////////////////////////////////////////////
// PATCH FS ////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(() => {
  const ancestor = {};
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
  ancestor.realpathSync.native = fs.realpathSync;
  ancestor.realpath = fs.realpath;
  ancestor.realpath.native = fs.realpath;
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
  ancestor.mkdirSync = fs.mkdirSync;
  ancestor.mkdir = fs.mkdir;
  ancestor.createReadStream = fs.createReadStream;

  const windows = process.platform === 'win32';

  const docks = {};
  const ENOTDIR = windows ? 4052 : 20;
  const ENOENT = windows ? 4058 : 2;
  const EISDIR = windows ? 4068 : 21;

  function assertEncoding(encoding) {
    if (encoding && !Buffer.isEncoding(encoding)) {
      throw new Error(`Unknown encoding: ${encoding}`);
    }
  }

  function maybeCallback(args) {
    var cb = args[args.length - 1];
    return typeof cb === 'function' ? cb : rethrow;
  }

  function error_ENOENT(fileOrDirectory, f) {
    // eslint-disable-line camelcase
    var error = new Error(
      `${fileOrDirectory} '${stripSnapshot(f)}' ` +
        `was not included into executable at compilation stage. ` +
        `Please recompile adding it as asset or script.`
    );
    error.errno = -ENOENT;
    error.code = 'ENOENT';
    error.path = f;
    error.pkg = true;
    return error;
  }

  function error_EISDIR(f) {
    // eslint-disable-line camelcase
    var error = new Error('EISDIR: illegal operation on a directory, read');
    error.errno = -EISDIR;
    error.code = 'EISDIR';
    error.path = f;
    error.pkg = true;
    return error;
  }

  function error_ENOTDIR(f) {
    // eslint-disable-line camelcase
    var error = new Error(`ENOTDIR: not a directory, scandir '${f}'`);
    error.errno = -ENOTDIR;
    error.code = 'ENOTDIR';
    error.path = f;
    error.pkg = true;
    return error;
  }

  // ///////////////////////////////////////////////////////////////
  // open //////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function removeTemporaryFolderAndContent(folder) {
    if (!folder) return;
    if (NODE_VERSION_MAJOR <= 14) {
      if (NODE_VERSION_MAJOR <= 10) {
        // folder must be empty
        for (const f of fs.readdirSync(folder)) {
          fs.unlinkSync(path.join(folder, f));
        }
        fs.rmdirSync(folder);
      } else {
        fs.rmdirSync(folder, { recursive: true });
      }
    } else {
      fs.rmSync(folder, { recursive: true });
    }
  }
  const temporaryFiles = {};
  const os = require('os');
  let tmpFolder = '';
  process.on('beforeExit', () => {
    removeTemporaryFolderAndContent(tmpFolder);
  });
  function deflateSync(snapshotFilename) {
    if (!tmpFolder) tmpFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'pkg-'));
    const content = fs.readFileSync(snapshotFilename, { encoding: 'binary' });
    // content is already unziped !
    const hash = createHash('sha256').update(content).digest('hex');
    const fName = path.join(tmpFolder, hash);
    fs.writeFileSync(fName, content);
    return fName;
  }
  function uncompressExternally(snapshotFilename) {
    let t = temporaryFiles[snapshotFilename];
    if (!t) {
      const tmpFile = deflateSync(snapshotFilename);
      t = { tmpFile };
      temporaryFiles[snapshotFilename] = t;
    }
    return t.tmpFile;
  }
  function uncompressExternallyAndOpen(snapshotFilename) {
    const externalFile = uncompressExternally(snapshotFilename);
    const fd = fs.openSync(externalFile, 'r');
    return fd;
  }

  function openFromSnapshot(f, cb) {
    const cb2 = cb || rethrow;
    const entity = findVirtualFileSystemEntry(f);
    if (!entity) return cb2(error_ENOENT('File or directory', f));
    const dock = { path: f, entity, position: 0 };
    const nullDevice = windows ? '\\\\.\\NUL' : '/dev/null';
    if (cb) {
      ancestor.open.call(fs, nullDevice, 'r', (error, fd) => {
        if (error) return cb(error);
        docks[fd] = dock;
        cb(null, fd);
      });
    } else {
      const fd = ancestor.openSync.call(fs, nullDevice, 'r');
      docks[fd] = dock;
      return fd;
    }
  }

  let bypassCompressCheckWhenCallbyCreateReadStream = false;

  fs.createReadStream = function createReadStream(f) {
    if (!insideSnapshot(f)) {
      return ancestor.createReadStream.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.createReadStream.apply(fs, translateNth(arguments, 0, f));
    }
    bypassCompressCheckWhenCallbyCreateReadStream = true;
    const stream = ancestor.createReadStream.apply(fs, arguments);
    bypassCompressCheckWhenCallbyCreateReadStream = false;

    if (DOCOMPRESS === GZIP) {
      return stream.pipe(createGunzip());
    }
    if (DOCOMPRESS === BROTLI) {
      return stream.pipe(createBrotliDecompress());
    }
    return stream;
  };
  fs.openSync = function openSync(f) {
    if (!insideSnapshot(f)) {
      return ancestor.openSync.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.openSync.apply(fs, translateNth(arguments, 0, f));
    }
    if (DOCOMPRESS && !bypassCompressCheckWhenCallbyCreateReadStream) {
      return uncompressExternallyAndOpen(f);
    }
    return openFromSnapshot(f);
  };

  fs.open = function open(f) {
    if (!insideSnapshot(f)) {
      return ancestor.open.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.open.apply(fs, translateNth(arguments, 0, f));
    }
    const callback = dezalgo(maybeCallback(arguments));
    if (DOCOMPRESS && !bypassCompressCheckWhenCallbyCreateReadStream) {
      const fd = uncompressExternallyAndOpen(f);
      return callback(null, fd);
    }
    openFromSnapshot(f, callback);
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
    let p;
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
      const bytesRead = payloadCopyUni(
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
    const cb2 = cb || rethrow;
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

    const dock = docks[fd];
    const { entity } = dock;
    const entityLinks = entity[STORE_LINKS];
    if (entityLinks) return cb2(error_EISDIR(dock.path));
    const entityContent = entity[STORE_CONTENT];
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

    const callback = dezalgo(maybeCallback(arguments));
    readFromSnapshot(fd, buffer, offset, length, position, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // write /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function writeToSnapshot(cb) {
    const cb2 = cb || rethrow;
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

    const callback = dezalgo(maybeCallback(arguments));
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

    const callback = dezalgo(maybeCallback(arguments));
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

  function readFileFromSnapshot(filename, cb) {
    const cb2 = cb || rethrow;

    const entity = findVirtualFileSystemEntry(filename);
    if (!entity) return cb2(error_ENOENT('File', filename));

    const entityLinks = entity[STORE_LINKS];
    if (entityLinks) return cb2(error_EISDIR(filename));

    const entityContent = entity[STORE_CONTENT];
    if (entityContent) return readFileFromSnapshotSub(entityContent, cb);

    const entityBlob = entity[STORE_BLOB];
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

  fs.readFileSync = function readFileSync(f, options_) {
    if (f === 'dirty-hack-for-testing-purposes') {
      return f;
    }

    if (!insideSnapshot(f)) {
      return ancestor.readFileSync.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.readFileSync.apply(fs, translateNth(arguments, 0, f));
    }

    const options = readFileOptions(options_, false);

    if (!options) {
      return ancestor.readFileSync.apply(fs, arguments);
    }

    const { encoding } = options;
    assertEncoding(encoding);

    let buffer = readFileFromSnapshot(f);
    if (encoding) buffer = buffer.toString(encoding);
    return buffer;
  };

  fs.readFile = function readFile(f, options_) {
    if (!insideSnapshot(f)) {
      return ancestor.readFile.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.readFile.apply(fs, translateNth(arguments, 0, f));
    }

    const options = readFileOptions(options_, true);

    if (!options) {
      return ancestor.readFile.apply(fs, arguments);
    }

    const { encoding } = options;
    assertEncoding(encoding);

    var callback = dezalgo(maybeCallback(arguments));
    readFileFromSnapshot(f, (error, buffer) => {
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

  const noop = () => false;
  Dirent.prototype.isBlockDevice = noop;
  Dirent.prototype.isCharacterDevice = noop;
  Dirent.prototype.isSocket = noop;
  Dirent.prototype.isFIFO = noop;

  Dirent.prototype.isSymbolicLink = (fileOrFolderName) =>
    Boolean(SYMLINKS[fileOrFolderName]);

  function getFileTypes(f, entries) {
    return entries.map((entry) => {
      const ff = path.join(f, entry);
      const entity = findVirtualFileSystemEntry(ff);
      if (entity[STORE_BLOB] || entity[STORE_CONTENT])
        return new Dirent(entry, 1);
      if (entity[STORE_LINKS]) return new Dirent(entry, 2);
      throw new Error('UNEXPECTED-24');
    });
  }

  function readdirRoot(file, cb) {
    if (cb) {
      ancestor.readdir(file, (error, entries) => {
        if (error) return cb(error);
        entries.push('snapshot');
        cb(null, entries);
      });
    } else {
      const entries = ancestor.readdirSync(file);
      entries.push('snapshot');
      return entries;
    }
  }

  function readdirFromSnapshotSub(entityLinks, file, cb) {
    if (cb) {
      payloadFile(entityLinks, (error, buffer) => {
        if (error) return cb(error);
        cb(null, JSON.parse(buffer).concat(readdirMountpoints(file)));
      });
    } else {
      const buffer = payloadFileSync(entityLinks);
      return JSON.parse(buffer).concat(readdirMountpoints(file));
    }
  }

  function readdirFromSnapshot(folder, isRoot, cb) {
    var cb2 = cb || rethrow;
    if (isRoot) return readdirRoot(folder, cb);

    const entity = findVirtualFileSystemEntry(folder);

    if (!entity) return cb2(error_ENOENT('Directory', folder));
    const entityBlob = entity[STORE_BLOB];
    if (entityBlob) return cb2(error_ENOTDIR(folder));
    const entityContent = entity[STORE_CONTENT];
    if (entityContent) return cb2(error_ENOTDIR(folder));
    const entityLinks = entity[STORE_LINKS];
    if (entityLinks) return readdirFromSnapshotSub(entityLinks, folder, cb);
    return cb2(new Error('UNEXPECTED-25'));
  }

  fs.readdirSync = function readdirSync(f, options_) {
    const isRoot = isRootPath(f);

    if (!insideSnapshot(f) && !isRoot) {
      return ancestor.readdirSync.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.readdirSync.apply(fs, translateNth(arguments, 0, f));
    }

    const options = readdirOptions(options_, false);

    if (!options || options.withFileTypes) {
      return ancestor.readdirSync.apply(fs, arguments);
    }

    let entries = readdirFromSnapshot(f, isRoot);
    if (options.withFileTypes) entries = getFileTypes(f, entries);
    return entries;
  };

  fs.readdir = function readdir(f, options_) {
    const isRoot = isRootPath(f);

    if (!insideSnapshot(f) && !isRoot) {
      return ancestor.readdir.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.readdir.apply(fs, translateNth(arguments, 0, f));
    }

    const options = readdirOptions(options_, true);

    if (!options || options.withFileTypes) {
      return ancestor.readdir.apply(fs, arguments);
    }

    const callback = dezalgo(maybeCallback(arguments));
    readdirFromSnapshot(f, isRoot, (error, entries) => {
      if (error) return callback(error);
      if (options.withFileTypes) entries = getFileTypes(f, entries);
      callback(null, entries);
    });
  };

  // ///////////////////////////////////////////////////////////////
  // realpath //////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  fs.realpathSync = function realpathSync(f) {
    if (!insideSnapshot(f)) {
      return ancestor.realpathSync.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      // app should not know real file name
      return f;
    }

    const realPath = realpathFromSnapshot(f);
    return realPath;
  };

  fs.realpath = function realpath(f) {
    if (!insideSnapshot(f)) {
      return ancestor.realpath.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      // app should not know real file name
      return f;
    }

    const callback = dezalgo(maybeCallback(arguments));
    callback(null, realpathFromSnapshot(f));
  };

  fs.realpathSync.native = fs.realpathSync;
  fs.realpath.native = fs.realpath;

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

    const { isFileValue } = s;
    const { isDirectoryValue } = s;
    const { isSocketValue } = s;
    const { isSymbolicLinkValue } = s;

    delete s.isFileValue;
    delete s.isDirectoryValue;
    delete s.isSocketValue;
    delete s.isSymbolicLinkValue;

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
      return isSymbolicLinkValue;
    };
    s.isFIFO = function isFIFO() {
      return false;
    };

    return s;
  }

  function findNativeAddonForStat(f, cb) {
    const cb2 = cb || rethrow;
    const foundPath = findNativeAddonSyncUnderRequire(f);
    if (!foundPath) return cb2(error_ENOENT('File or directory', f));
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
      const buffer = payloadFileSync(entityStat);
      return restore(JSON.parse(buffer));
    }
  }

  function statFromSnapshot(filename, cb) {
    const cb2 = cb || rethrow;
    const entity = findVirtualFileSystemEntry(filename);
    if (!entity) return findNativeAddonForStat(filename, cb);
    const entityStat = entity[STORE_STAT];
    if (entityStat) return statFromSnapshotSub(entityStat, cb);
    return cb2(new Error('UNEXPECTED-35'));
  }

  fs.statSync = function statSync(f) {
    if (!insideSnapshot(f)) {
      return ancestor.statSync.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.statSync.apply(fs, translateNth(arguments, 0, f));
    }

    return statFromSnapshot(f);
  };

  fs.stat = function stat(f) {
    if (!insideSnapshot(f)) {
      return ancestor.stat.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.stat.apply(fs, translateNth(arguments, 0, f));
    }

    const callback = dezalgo(maybeCallback(arguments));
    statFromSnapshot(f, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // lstat /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  fs.lstatSync = function lstatSync(f) {
    if (!insideSnapshot(f)) {
      return ancestor.lstatSync.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.lstatSync.apply(fs, translateNth(arguments, 0, f));
    }

    return statFromSnapshot(f);
  };

  fs.lstat = function lstat(f) {
    if (!insideSnapshot(f)) {
      return ancestor.lstat.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.lstat.apply(fs, translateNth(arguments, 0, f));
    }

    const callback = dezalgo(maybeCallback(arguments));
    statFromSnapshot(f, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // fstat /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function fstatFromSnapshot(fd, cb) {
    const cb2 = cb || rethrow;
    const { entity } = docks[fd];
    const entityStat = entity[STORE_STAT];
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

    const callback = dezalgo(maybeCallback(arguments));
    fstatFromSnapshot(fd, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // exists ////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function findNativeAddonForExists(f) {
    const foundPath = findNativeAddonSyncFreeFromRequire(f);
    if (!foundPath) return false;
    return ancestor.existsSync.call(fs, foundPath);
  }

  function existsFromSnapshot(f) {
    const fShort = normalizePathAndFollowLink(f);
    const entity = VIRTUAL_FILESYSTEM[fShort];
    if (!entity) return findNativeAddonForExists(f);
    return true;
  }

  fs.existsSync = function existsSync(f) {
    if (!insideSnapshot(f)) {
      return ancestor.existsSync.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.existsSync.apply(fs, translateNth(arguments, 0, f));
    }

    return existsFromSnapshot(f);
  };

  fs.exists = function exists(f) {
    if (!insideSnapshot(f)) {
      return ancestor.exists.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.exists.apply(fs, translateNth(arguments, 0, f));
    }

    const callback = dezalgo(maybeCallback(arguments));
    callback(existsFromSnapshot(f));
  };

  // ///////////////////////////////////////////////////////////////
  // access ////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function accessFromSnapshot(filename, cb) {
    const cb2 = cb || rethrow;
    const entity = findVirtualFileSystemEntry(filename);
    if (!entity) return cb2(error_ENOENT('File or directory', filename));
    return cb2(null, undefined);
  }

  fs.accessSync = function accessSync(f) {
    if (!insideSnapshot(f)) {
      return ancestor.accessSync.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.accessSync.apply(fs, translateNth(arguments, 0, f));
    }

    return accessFromSnapshot(f);
  };

  fs.access = function access(f) {
    if (!insideSnapshot(f)) {
      return ancestor.access.apply(fs, arguments);
    }
    if (insideMountpoint(f)) {
      return ancestor.access.apply(fs, translateNth(arguments, 0, f));
    }

    const callback = dezalgo(maybeCallback(arguments));
    accessFromSnapshot(f, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // mkdir /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function mkdirFailInSnapshot(path_, cb) {
    var cb2 = cb || rethrow;
    return cb2(
      new Error('Cannot mkdir in a snapshot. Try mountpoints instead.')
    );
  }

  fs.mkdirSync = function mkdirSync(folderName) {
    if (!insideSnapshot(folderName)) {
      return ancestor.mkdirSync.apply(fs, arguments);
    }
    if (insideMountpoint(folderName)) {
      return ancestor.mkdirSync.apply(
        fs,
        translateNth(arguments, 0, folderName)
      );
    }

    return mkdirFailInSnapshot(folderName);
  };

  fs.mkdir = function mkdir(folderName) {
    if (!insideSnapshot(folderName)) {
      return ancestor.mkdir.apply(fs, arguments);
    }
    if (insideMountpoint(folderName)) {
      return ancestor.mkdir.apply(fs, translateNth(arguments, 0, folderName));
    }

    var callback = dezalgo(maybeCallback(arguments));
    mkdirFailInSnapshot(folderName, callback);
  };

  // ///////////////////////////////////////////////////////////////
  // promises ////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  const ancestor_promises = {};
  if (fs.promises !== undefined) {
    var util = require('util');
    ancestor_promises.open = fs.promises.open;
    ancestor_promises.read = fs.promises.read;
    ancestor_promises.write = fs.promises.write;
    ancestor_promises.readFile = fs.promises.readFile;
    ancestor_promises.readdir = fs.promises.readdir;
    ancestor_promises.realpath = fs.promises.realpath;
    ancestor_promises.stat = fs.promises.stat;
    ancestor_promises.lstat = fs.promises.lstat;
    ancestor_promises.fstat = fs.promises.fstat;
    ancestor_promises.access = fs.promises.access;

    fs.promises.open = async function open(f) {
      if (!insideSnapshot(f)) {
        return ancestor_promises.open.apply(this, arguments);
      }
      if (insideMountpoint(f)) {
        return ancestor_promises.open.apply(
          this,
          translateNth(arguments, 0, f)
        );
      }
      const externalFile = uncompressExternally(f);
      arguments[0] = externalFile;
      const fd = await ancestor_promises.open.apply(this, arguments);
      if (typeof fd === 'object') {
        fd._pkg = { externalFile, file: f };
      }
      return fd;
    };
    fs.promises.readFile = async function readFile(f) {
      if (!insideSnapshot(f)) {
        return ancestor_promises.readFile.apply(this, arguments);
      }
      if (insideMountpoint(f)) {
        return ancestor_promises.readFile.apply(
          this,
          translateNth(arguments, 0, f)
        );
      }
      const externalFile = uncompressExternally(f);
      arguments[0] = externalFile;
      return ancestor_promises.readFile.apply(this, arguments);
    };
    fs.promises.write = async function write(fd) {
      if (fd._pkg) {
        throw new Error(
          `[PKG] Cannot write into Snapshot file : ${fd._pkg.file}`
        );
      }
      return ancestor_promises.write.apply(this, arguments);
    };
    fs.promises.readdir = util.promisify(fs.readdir);

    /*
    fs.promises.read = util.promisify(fs.read);
    fs.promises.realpath = util.promisify(fs.realpath);
    fs.promises.stat = util.promisify(fs.stat);
    fs.promises.lstat = util.promisify(fs.lstat);
    fs.promises.fstat = util.promisify(fs.fstat);
    fs.promises.access = util.promisify(fs.access);
  */
  }

  // ///////////////////////////////////////////////////////////////
  // INTERNAL //////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function makeLong(f) {
    return path._makeLong(f);
  }

  function revertMakingLong(f) {
    if (/^\\\\\?\\/.test(f)) return f.slice(4);
    return f;
  }

  function findNativeAddonForInternalModuleStat(f) {
    const fNative = findNativeAddonSyncUnderRequire(f);
    if (!fNative) return -ENOENT;
    return process.binding('fs').internalModuleStat(makeLong(fNative));
  }

  fs.internalModuleStat = function internalModuleStat(long) {
    // from node comments:
    // Used to speed up module loading. Returns 0 if the path refers to
    // a file, 1 when it's a directory or < 0 on error (usually -ENOENT).
    // The speedup comes from not creating thousands of Stat and Error objects.

    const f = revertMakingLong(long);

    if (!insideSnapshot(f)) {
      return process.binding('fs').internalModuleStat(long);
    }
    if (insideMountpoint(f)) {
      return process.binding('fs').internalModuleStat(makeLong(translate(f)));
    }

    const entity = findVirtualFileSystemEntry(f);

    if (!entity) return findNativeAddonForInternalModuleStat(f);
    const entityBlob = entity[STORE_BLOB];
    if (entityBlob) return 0;
    const entityContent = entity[STORE_CONTENT];
    if (entityContent) return 0;
    const entityLinks = entity[STORE_LINKS];
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
    const returnArray =
      (NODE_VERSION_MAJOR === 12 && NODE_VERSION_MINOR >= 19) ||
      (NODE_VERSION_MAJOR === 14 && NODE_VERSION_MINOR >= 5) ||
      NODE_VERSION_MAJOR >= 15;

    const f = revertMakingLong(long);
    const bindingFs = process.binding('fs');
    const readFile = (
      bindingFs.internalModuleReadFile || bindingFs.internalModuleReadJSON
    ).bind(bindingFs);
    if (!insideSnapshot(f)) {
      return readFile(long);
    }
    if (insideMountpoint(f)) {
      return readFile(makeLong(translate(f)));
    }

    const entity = findVirtualFileSystemEntry(f);

    if (!entity) {
      return returnArray ? [undefined, false] : undefined;
    }

    const entityContent = entity[STORE_CONTENT];
    if (!entityContent) {
      return returnArray ? [undefined, false] : undefined;
    }
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
  const Module = require('module');
  const ancestor = {};
  ancestor.require = Module.prototype.require;
  ancestor._compile = Module.prototype._compile;
  ancestor._resolveFilename = Module._resolveFilename;
  ancestor.runMain = Module.runMain;

  Module.prototype.require = function require(f) {
    try {
      return ancestor.require.apply(this, arguments);
    } catch (error) {
      if (
        (error.code === 'ENOENT' || error.code === 'MODULE_NOT_FOUND') &&
        !insideSnapshot(f) &&
        !path.isAbsolute(f)
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

  let im;
  let makeRequireFunction;

  if (NODE_VERSION_MAJOR === 0) {
    makeRequireFunction = (self) => {
      function rqfn(f) {
        return self.require(f);
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

    const entity = findVirtualFileSystemEntry(filename_);

    if (!entity) {
      // let user try to "_compile" a packaged file
      return ancestor._compile.apply(this, arguments);
    }

    const entityBlob = entity[STORE_BLOB];
    const entityContent = entity[STORE_CONTENT];

    if (entityBlob) {
      const options = {
        filename: filename_,
        lineOffset: 0,
        displayErrors: true,
        cachedData: payloadFileSync(entityBlob),
        sourceless: !entityContent,
      };

      const { Script } = require('vm');
      const code = entityContent
        ? require('module').wrap(payloadFileSync(entityContent))
        : undefined;

      const script = new Script(code, options);
      const wrapper = script.runInThisContext(options);
      if (!wrapper) process.exit(4); // for example VERSION_MISMATCH
      const dirname = path.dirname(filename_);
      const rqfn = makeRequireFunction(this);
      const args = [this.exports, rqfn, this, filename_, dirname];
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
    let filename;
    let flagWasOn = false;
    try {
      filename = ancestor._resolveFilename.apply(this, arguments);
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error;

      FLAG_ENABLE_PROJECT = true;
      const savePathCache = Module._pathCache;
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
        const found = findNativeAddonSyncUnderRequire(filename);
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
    const opts = args[pos];
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
      for (let i = 1; i < args[1].length; i += 1) {
        const mbc = args[1][i - 1];
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
      value(f) {
        return new Promise((resolve) => {
          require('fs').exists(f, (exists) => {
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
        reject = rej;
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
  var ancestor = {};
  ancestor.dlopen = process.dlopen;

  function revertMakingLong(f) {
    if (/^\\\\\?\\/.test(f)) return f.slice(4);
    return f;
  }

  process.dlopen = function dlopen() {
    const args = cloneArgs(arguments);
    const modulePath = revertMakingLong(args[1]);
    const moduleBaseName = path.basename(modulePath);
    const moduleFolder = path.dirname(modulePath);
    const unknownModuleErrorRegex = /([^:]+): cannot open shared object file: No such file or directory/;

    function tryImporting(_tmpFolder, previousErrorMessage) {
      try {
        const res = ancestor.dlopen.apply(process, args);
        return res;
      } catch (e) {
        if (e.message === previousErrorMessage) {
          // we already tried to fix this and it didn't work, give up
          throw e;
        }
        if (e.message.match(unknownModuleErrorRegex)) {
          // this case triggers on linux, the error message give us a clue on what dynamic linking library
          // is missing.
          // some modules are packaged with dynamic linking and needs to open other files that should be in
          // the same directory, in this case, we write this file in the same /tmp directory and try to
          // import the module again

          const moduleName = e.message.match(unknownModuleErrorRegex)[1];
          const importModulePath = path.join(moduleFolder, moduleName);

          if (!fs.existsSync(importModulePath)) {
            throw new Error(
              `INTERNAL ERROR this file doesn't exist in the virtual file system :${importModulePath}`
            );
          }
          const moduleContent1 = fs.readFileSync(importModulePath);
          const tmpModulePath1 = path.join(_tmpFolder, moduleName);

          try {
            fs.statSync(tmpModulePath1);
          } catch (err) {
            fs.writeFileSync(tmpModulePath1, moduleContent1, { mode: 0o555 });
          }
          return tryImporting(_tmpFolder, e.message);
        }

        // this case triggers on windows mainly.
        // we copy all stuff that exists in the folder of the .node module
        // into the tempory folders...
        const files = fs.readdirSync(moduleFolder);
        for (const file of files) {
          if (file === moduleBaseName) {
            // ignore the current module
            continue;
          }
          const filenameSrc = path.join(moduleFolder, file);

          if (fs.statSync(filenameSrc).isDirectory()) {
            continue;
          }
          const filenameDst = path.join(_tmpFolder, file);
          const content = fs.readFileSync(filenameSrc);

          fs.writeFileSync(filenameDst, content, { mode: 0o555 });
        }
        return tryImporting(_tmpFolder, e.message);
      }
    }
    if (insideSnapshot(modulePath)) {
      const moduleContent = fs.readFileSync(modulePath);

      // Node addon files and .so cannot be read with fs directly, they are loaded with process.dlopen which needs a filesystem path
      // we need to write the file somewhere on disk first and then load it
      const hash = createHash('sha256').update(moduleContent).digest('hex');

      const tmpFolder = path.join(require('os').tmpdir(), hash);
      if (!fs.existsSync(tmpFolder)) {
        fs.mkdirSync(tmpFolder);
      }
      const tmpModulePath = path.join(tmpFolder, moduleBaseName);

      try {
        fs.statSync(tmpModulePath);
      } catch (e) {
        // Most likely this means the module is not on disk yet
        fs.writeFileSync(tmpModulePath, moduleContent, { mode: 0o755 });
      }
      args[1] = tmpModulePath;
      tryImporting(tmpFolder);
    } else {
      return ancestor.dlopen.apply(process, args);
    }
  };
})();
