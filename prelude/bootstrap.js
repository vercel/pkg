/* eslint-disable no-multi-spaces */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-rest-params */

/* global REQUIRE_COMMON */
/* global VIRTUAL_FILESYSTEM */
/* global DEFAULT_ENTRYPOINT */

'use strict';

var common = {};
REQUIRE_COMMON(common);

var STORE_CODE = common.STORE_CODE;
var STORE_CONTENT = common.STORE_CONTENT;
var STORE_LINKS = common.STORE_LINKS;
var STORE_STAT = common.STORE_STAT;

var normalizePath = common.normalizePath;
var insideSnapshot = common.insideSnapshot;
var stripSnapshot = common.stripSnapshot;

var ENTRYPOINT;
var FLAG_FORK_WAS_CALLED = false;
var FLAG_DISABLE_DOT_NODE = false;
var NODE_VERSION_MAJOR = process.version.match(/^v(\d+)/)[1] | 0;

// /////////////////////////////////////////////////////////////////
// ENTRYPOINT //////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

ENTRYPOINT = process.argv[1];
if (ENTRYPOINT === 'DEFAULT_ENTRYPOINT') {
  ENTRYPOINT = process.argv[1] = DEFAULT_ENTRYPOINT;
}

if (!insideSnapshot(ENTRYPOINT)) {
  return { undoPatch: true };
}

// /////////////////////////////////////////////////////////////////
// MOUNTPOINTS /////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

var mountpoints = [];

function insideMountpoint (f) {
  if (!insideSnapshot(f)) return null;
  var file = normalizePath(f);
  var found = mountpoints.map(function (mountpoint) {
    var interior = mountpoint.interior;
    var exterior = mountpoint.exterior;
    if (interior === file) return exterior;
    var left = interior + require('path').sep;
    if (file.slice(0, left.length) !== left) return null;
    return exterior + file.slice(left.length - 1);
  }).filter(function (result) {
    return result;
  });
  if (found.length >= 2) throw new Error('UNEXPECTED-00');
  if (found.length === 0) return null;
  return found[0];
}

function readdirMountpoints (path) {
  return mountpoints.map(function (mountpoint) {
    return mountpoint.interior;
  }).filter(function (interior) {
    return require('path').dirname(interior) === path;
  }).map(function (interior) {
    return require('path').basename(interior);
  });
}

function translate (f) {
  var result = insideMountpoint(f);
  if (!result) throw new Error('UNEXPECTED-05');
  return result;
}

function cloneArgs (args_) {
  return Array.prototype.slice.call(args_);
}

function translateNth (args_, index, f) {
  var args = cloneArgs(args_);
  args[index] = translate(f);
  return args;
}

function createMountpoint (interior, exterior) {
  // TODO validate
  mountpoints.push({ interior: interior, exterior: exterior });
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

function projectToFilesystem (f) {
  return require('path').join(
    require('path').dirname(
      process.execPath
    ),
    require('path').relative(
      require('path').dirname(
        DEFAULT_ENTRYPOINT
      ), f
    )
  );
}

function projectToNearby (f) {
  return require('path').join(
    require('path').dirname(
      process.execPath
    ),
    require('path').basename(
      f
    )
  );
}

function findNativeAddon (path) {
  if (!insideSnapshot(path)) throw new Error('UNEXPECTED-10');
  if (path.slice(-5) !== '.node') return null; // leveldown.node.js
  var projector = projectToFilesystem(path);
  if (require('fs').existsSync(projector)) return projector;
  if (FLAG_DISABLE_DOT_NODE) return null; // FLAG influences only nearby
  projector = projectToNearby(path);
  if (require('fs').existsSync(projector)) return projector;
  return null;
}

// /////////////////////////////////////////////////////////////////
// NATIVE ADDON IAT ////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

var modifyNativeAddonWin32 = (function () {
  var fs = require('fs');

  return function (addon) {
    var modifiedAddon;

    var newExeName = require('path').basename(process.execPath);
    // sometimes there is "index.EXE"
    if (newExeName.slice(-4).toLowerCase() === '.exe') {
      newExeName = newExeName.slice(0, -4) + '.exe';
    }

    if (addon.slice(-5) === '.node') {
      modifiedAddon = addon.slice(0, -5) + '.' + newExeName + '.node';
    } else {
      modifiedAddon = addon + '.' + newExeName;
    }

    if (fs.existsSync(modifiedAddon)) {
      return modifyNativeAddonWin32(modifiedAddon, newExeName);
    }

    // http://www.sunshine2k.de/reversing/tuts/tut_pe.htm
    // http://www.sunshine2k.de/reversing/tuts/tut_rvait.htm
    // http://marcoramilli.blogspot.ru/2010/12/windows-pe-header.html
    // http://www.pelib.com/resources/luevel.txt
    // http://www.zotteljedi.de/pub/pe.txt

    var f = fs.readFileSync(addon);
    var peHeader = f.readInt32LE(0x3C);
    var numberOfSections = f.readInt16LE(peHeader + 0x06);
    var ia32 = (f.readInt16LE(peHeader + 0x18) !== 0x020B); // ia32 or x64
    var optHeaderSize = f.readInt16LE(peHeader + 0x14);
    var firstSection = peHeader + 0x18 + optHeaderSize;

    function readStringToZero (p_) {
      if (p_ === 0) return '';
      var s = '';
      var p = p_;
      var c;
      while (true) {
        c = f[p];
        if (c === 0) break;
        if (s.length > 255) break;
        s += String.fromCharCode(c);
        p += 1;
      }
      return s;
    }

    function writeString (p, s) {
      var b = (new Buffer(s + '\x00'));
      b.copy(f, p);
      return b.length;
    }

    var sections = [];

    (function () {
      var pos = firstSection;
      var section;
      while (true) {
        if (sections.length === numberOfSections) break;
        section = {};
        section.pos = pos;
        section.name = readStringToZero(pos);
        section.virtualAddress = f.readInt32LE(pos + 0x0C);
        section.rawAddress = f.readInt32LE(pos + 0x14);
        section.virtualSize = f.readInt32LE(pos + 0x08);
        section.rawSize = f.readInt32LE(pos + 0x10);
        section.writeBack = function () {
          f.writeInt32LE(this.virtualSize, this.pos + 0x08);
        };
        sections.push(section);
        pos += 0x28;
      }
    }());

    function rva2section (rva) {
      var result = null;
      sections.some(function (section) {
        if ((rva >= section.virtualAddress) &&
            (rva < section.virtualAddress + section.virtualSize)) {
          result = section;
          return true;
        }
      });
      return result;
    }

    function rva2raw (rva) {
      var section = rva2section(rva);
      return rva - section.virtualAddress + section.rawAddress;
    }

    function raw2rva (raw, section) {
      return raw + section.virtualAddress - section.rawAddress;
    }

    var firstRva = f.readInt32LE(peHeader + (ia32 ? 0x80 : 0x90));
    var firstRaw = rva2raw(firstRva);

    var imps = [];

    (function () {
      var pos = firstRaw;
      var imp;
      while (true) {
        imp = {};
        imp.pos = pos;
        imp.firstThunkRva = f.readInt32LE(pos + 0x00);
        if (imp.firstThunkRva === 0) break;
        imp.firstThunkRaw = rva2raw(imp.firstThunkRva);
        imp.name = {};
        imp.name.pos = pos + 0x0C;
        imp.name.posRva = f.readInt32LE(imp.name.pos);
        imp.name.posRaw = rva2raw(imp.name.posRva);
        imp.name.section = rva2section(imp.name.posRva);
        imp.name.getValue = function () {
          return readStringToZero(this.posRaw);
        };
        imp.name.value = imp.name.getValue();
        imp.name.raw2rva = function () {
          this.posRva = raw2rva(this.posRaw, this.section);
        };
        imp.name.writeBack = function () {
          f.writeInt32LE(this.posRva, this.pos);
        };
        imps.push(imp);
        pos += 0x14;
      }
    }());

    imps.some(function (imp) {
      var firstThunkRaw = imp.firstThunkRaw;

      var thunks = [];
      (function () {
        var posLink = firstThunkRaw;
        var pos, posHi, posRva, posRaw, thunk;
        while (true) {
          pos = f.readUInt32LE(posLink);
          if (!ia32) {
            posHi = f.readUInt32LE(posLink + 0x04);
            pos += posHi; // result is 80000006
          }
          if (pos === 0) {
            break;
          } else
          if (pos & 0x80000000) {
            posRva = pos;
            thunk = {};
            thunk.pos = 0;
            thunk.name = posRva.toString(16);
            thunks.push(thunk);
            posLink += (ia32 ? 0x04 : 0x08);
          } else {
            posRva = f.readInt32LE(posLink);
            posRaw = rva2raw(posRva);
            thunk = {};
            thunk.pos = posRaw;
            thunk.name = readStringToZero(thunk.pos + 0x02);
            thunks.push(thunk);
            posLink += (ia32 ? 0x04 : 0x08);
          }
        }
      }());

      imp.thunks = thunks;
    });

    var impNode = imps.filter(function (imp) {
      return imp.thunks.some(function (thunk) {
        return (thunk.name === 'node_module_register');
      });
    })[0];

    if (!impNode) {
      // odd
      return addon;
    }

    if (impNode.name.getValue().toLowerCase() ===
                     newExeName.toLowerCase()) {
      // already ok
      return addon;
    }

    var placeSection = impNode.name.section;
    var place = placeSection.rawAddress + placeSection.virtualSize;
    placeSection.virtualSize += writeString(place, newExeName);
    placeSection.writeBack();
    impNode.name.posRaw = place;
    impNode.name.raw2rva();
    impNode.name.writeBack();
    fs.writeFileSync(modifiedAddon, f);
    return modifiedAddon;
  };
}());

// /////////////////////////////////////////////////////////////////
// SETUP PROCESS ///////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(function () {
  process.pkg = {};
  process.versions.pkg = '%PKG_VERSION%';
  process.pkg.mount = createMountpoint;
  process.pkg.entrypoint = ENTRYPOINT;
  process.pkg.defaultEntrypoint = DEFAULT_ENTRYPOINT;
}());

// /////////////////////////////////////////////////////////////////
// PATH.RESOLVE REPLACEMENT ////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(function () {
  var path = require('path');

  process.pkg.path = {};
  process.pkg.path.resolve = function () {
    var args = cloneArgs(arguments);
    args.unshift(path.dirname(ENTRYPOINT));
    return path.resolve.apply(path, args); // eslint-disable-line prefer-spread
  };
}());

// /////////////////////////////////////////////////////////////////
// PATCH FS ////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(function () {
  var fs = require('fs');
  var ancestor = {};
  ancestor.openSync =         fs.openSync;
  ancestor.open =             fs.open;
  ancestor.readSync =         fs.readSync;
  ancestor.read =             fs.read;
  ancestor.writeSync =        fs.writeSync;
  ancestor.write =            fs.write;
  ancestor.closeSync =        fs.closeSync;
  ancestor.close =            fs.close;
  ancestor.readFileSync =     fs.readFileSync;
  ancestor.readFile =         fs.readFile;
  // ancestor.writeFileSync = fs.writeFileSync; // based on openSync/writeSync/closeSync
  // ancestor.writeFile =     fs.writeFile; // based on open/write/close
  ancestor.readdirSync =      fs.readdirSync;
  ancestor.readdir =          fs.readdir;
  ancestor.realpathSync =     fs.realpathSync;
  ancestor.realpath =         fs.realpath;
  ancestor.statSync =         fs.statSync;
  ancestor.stat =             fs.stat;
  ancestor.lstatSync =        fs.lstatSync;
  ancestor.lstat =            fs.lstat;
  ancestor.fstatSync =        fs.fstatSync;
  ancestor.fstat =            fs.fstat;
  ancestor.existsSync =       fs.existsSync;
  ancestor.exists =           fs.exists;
  ancestor.accessSync =       fs.accessSync;
  ancestor.access =           fs.access;

  var windows = process.platform === 'win32';

  var docks = {};
  var ENOTDIR = windows ? 4052 : 20;
  var ENOENT = windows ? 4058 : 2;
  var EISDIR = windows ? 4068 : 21;

  function assertEncoding (encoding) {
    if (encoding && !Buffer.isEncoding(encoding)) {
      throw new Error('Unknown encoding: ' + encoding);
    }
  }

  function rethrow () {
    return function (error) {
      if (error) throw error;
    };
  }

  function maybeCallback (args) {
    var cb = args[args.length - 1];
    return typeof cb === 'function' ? cb : rethrow();
  }

  function error_ENOENT (fileOrDirectory, path) { // eslint-disable-line camelcase
    var error = new Error(
      fileOrDirectory + ' \'' + stripSnapshot(path) + '\' ' +
      'was not included into executable at compilation stage. ' +
      'Please recompile adding it as asset or script.'
    );
    error.errno = -ENOENT;
    error.code = 'ENOENT';
    error.path = path;
    error.pkg = true;
    return error;
  }

  function error_EISDIR (path) { // eslint-disable-line camelcase
    var error = new Error(
      'EISDIR: illegal operation on a directory, read'
    );
    error.errno = -EISDIR;
    error.code = 'EISDIR';
    error.path = path;
    error.pkg = true;
    return error;
  }

  function error_ENOTDIR (path) { // eslint-disable-line camelcase
    var error = new Error(
      'ENOTDIR: not a directory, scandir \'' + path + '\''
    );
    error.errno = -ENOTDIR;
    error.code = 'ENOTDIR';
    error.path = path;
    error.pkg = true;
    return error;
  }

  // ///////////////////////////////////////////////////////////////
  // open //////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function openFromSnapshot (path_) {
    var path = normalizePath(path_);
    // console.log("openFromSnapshot", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) throw error_ENOENT('File or directory', path);
    var nullDevice = windows ? '\\\\.\\NUL' : '/dev/null';
    var fd = ancestor.openSync.call(fs, nullDevice, 'r');
    var dock = docks[fd] = {};
    dock.fd = fd;
    dock.path = path;
    dock.entity = entity;
    dock.position = 0;
    return fd;
  }

  fs.openSync = function (path) {
    if (!insideSnapshot(path)) {
      return ancestor.openSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.openSync.apply(fs, translateNth(arguments, 0, path));
    }

    return openFromSnapshot(path);
  };

  fs.open = function (path) {
    if (!insideSnapshot(path)) {
      return ancestor.open.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.open.apply(fs, translateNth(arguments, 0, path));
    }

    var callback = maybeCallback(arguments);
    try {
      var r = openFromSnapshot(path);
      process.nextTick(function () {
        callback(null, r);
      });
    } catch (error) {
      process.nextTick(function () {
        callback(error);
      });
    }
  };

  // ///////////////////////////////////////////////////////////////
  // read //////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function readFromSnapshotSub (dock, entityContent, buffer, offset, length, position) {
    var p = position;
    if ((p === null) || (typeof p === 'undefined')) p = dock.position;
    if (p >= entityContent.length) return 0;
    var end = p + length;
    var result = entityContent.copy(buffer, offset, p, end);
    dock.position = end;
    return result;
  }

  function readFromSnapshot (fd, buffer, offset, length, position) {
    if (offset < 0) throw new Error('Offset is out of bounds');
    if ((offset >= buffer.length) && (NODE_VERSION_MAJOR >= 6)) return 0;
    if (offset >= buffer.length) throw new Error('Offset is out of bounds');
    if (offset + length > buffer.length) throw new Error('Length extends beyond buffer');

    var dock = docks[fd];
    var entity = dock.entity;
    var entityContent = entity[STORE_CONTENT];
    if (entityContent) return readFromSnapshotSub(dock, entityContent, buffer, offset, length, position);
    var entityLinks = entity[STORE_LINKS];
    if (entityLinks) throw error_EISDIR(dock.path);
    throw new Error('UNEXPECTED-15');
  }

  fs.readSync = function (fd, buffer, offset, length, position) {
    if (!docks[fd]) {
      return ancestor.readSync.apply(fs, arguments);
    }

    return readFromSnapshot(fd, buffer, offset, length, position);
  };

  fs.read = function (fd, buffer, offset, length, position) {
    if (!docks[fd]) {
      return ancestor.read.apply(fs, arguments);
    }

    var callback = maybeCallback(arguments);
    try {
      var r = readFromSnapshot(
        fd, buffer, offset, length, position
      );
      process.nextTick(function () {
        callback(null, r, buffer);
      });
    } catch (error) {
      process.nextTick(function () {
        callback(error);
      });
    }
  };

  // ///////////////////////////////////////////////////////////////
  // write /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function writeToSnapshot () {
    throw new Error('Cannot write to packaged file');
  }

  fs.writeSync = function (fd) {
    if (!docks[fd]) {
      return ancestor.writeSync.apply(fs, arguments);
    }

    return writeToSnapshot();
  };

  fs.write = function (fd, buffer) {
    if (!docks[fd]) {
      return ancestor.write.apply(fs, arguments);
    }

    var callback = maybeCallback(arguments);
    try {
      var r = writeToSnapshot();
      process.nextTick(function () {
        callback(null, r, buffer);
      });
    } catch (error) {
      process.nextTick(function () {
        callback(error);
      });
    }
  };

  // ///////////////////////////////////////////////////////////////
  // close /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function closeFromSnapshot (fd) {
    ancestor.closeSync.call(fs, fd);
    delete docks[fd];
  }

  fs.closeSync = function (fd) {
    if (!docks[fd]) {
      return ancestor.closeSync.apply(fs, arguments);
    }

    return closeFromSnapshot(fd);
  };

  fs.close = function (fd) {
    if (!docks[fd]) {
      return ancestor.close.apply(fs, arguments);
    }

    var callback = maybeCallback(arguments);
    try {
      var r = closeFromSnapshot(fd);
      process.nextTick(function () {
        callback(null, r);
      });
    } catch (error) {
      process.nextTick(function () {
        callback(error);
      });
    }
  };

  // ///////////////////////////////////////////////////////////////
  // readFile //////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function readFileOptions (options, hasCallback) {
    if (!options || (hasCallback && typeof options === 'function')) {
      return { encoding: null, flag: 'r' };
    } else if (typeof options === 'string') {
      return { encoding: options, flag: 'r' };
    } else if (typeof options === 'object') {
      return options;
    } else {
      return null;
    }
  }

  function readFileFromSnapshot (path_) {
    var path = normalizePath(path_);
    // console.log("readFileFromSnapshot", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) throw error_ENOENT('File', path);
    var entityCode = entity[STORE_CODE];
    if (entityCode) return new Buffer('source-code-not-available');

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

    var entityContent = entity[STORE_CONTENT];
    if (entityContent) return new Buffer(entityContent); // clone to prevent mutating store
    var entityLinks = entity[STORE_LINKS];
    if (entityLinks) throw error_EISDIR(path);
    throw new Error('UNEXPECTED-20');
  }

  fs.readFileSync = function (path, options_) {
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

    var encoding = options.encoding;
    assertEncoding(encoding);
    var buffer = readFileFromSnapshot(path);
    if (encoding) buffer = buffer.toString(encoding);
    return buffer;
  };

  fs.readFile = function (path, options_) {
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

    var encoding = options.encoding;
    assertEncoding(encoding);

    var callback = maybeCallback(arguments);
    try {
      var buffer = readFileFromSnapshot(path);
      if (encoding) buffer = buffer.toString(encoding);
      process.nextTick(function () {
        callback(null, buffer);
      });
    } catch (error) {
      process.nextTick(function () {
        callback(error);
      });
    }
  };

  // ///////////////////////////////////////////////////////////////
  // writeFile /////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  // writeFileSync based on openSync/writeSync/closeSync
  // writeFile based on open/write/close

  // ///////////////////////////////////////////////////////////////
  // readdir ///////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function readdirFromSnapshot (path_) {
    var path = normalizePath(path_);
    // console.log("readdirFromSnapshot", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) throw error_ENOENT('Directory', path);
    var entityLinks = entity[STORE_LINKS];
    if (entityLinks) return entityLinks.concat(readdirMountpoints(path)); // immutable concat to prevent mutating store
    var entityCode = entity[STORE_CODE];
    if (entityCode) throw error_ENOTDIR(path);
    var entityContent = entity[STORE_CONTENT];
    if (entityContent) throw error_ENOTDIR(path);
    throw new Error('UNEXPECTED-25');
  }

  fs.readdirSync = function (path) {
    if (!insideSnapshot(path)) {
      return ancestor.readdirSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.readdirSync.apply(fs, translateNth(arguments, 0, path));
    }

    return readdirFromSnapshot(path);
  };

  fs.readdir = function (path) {
    if (!insideSnapshot(path)) {
      return ancestor.readdir.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.readdir.apply(fs, translateNth(arguments, 0, path));
    }

    var callback = maybeCallback(arguments);
    try {
      var r = readdirFromSnapshot(path);
      process.nextTick(function () {
        callback(null, r);
      });
    } catch (error) {
      process.nextTick(function () {
        callback(error);
      });
    }
  };

  // ///////////////////////////////////////////////////////////////
  // realpath //////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function realpathFromSnapshot (path_) {
    var path = normalizePath(path_);
    // console.log("realpathFromSnapshot", path);
    return path;
  }

  fs.realpathSync = function (path) {
    if (!insideSnapshot(path)) {
      return ancestor.realpathSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      // app should not know real file name
    }

    return realpathFromSnapshot(path);
  };

  fs.realpath = function (path) {
    if (!insideSnapshot(path)) {
      return ancestor.realpath.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      // app should not know real file name
    }

    var callback = maybeCallback(arguments);
    var r = realpathFromSnapshot(path);
    process.nextTick(function () {
      callback(null, r);
    });
  };

  // ///////////////////////////////////////////////////////////////
  // stat //////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function assertNumber (number) {
    if (typeof number !== 'number') throw new Error('UNEXPECTED-30');
  }

  function restoreStat (restore) {
    assertNumber(restore.atime);
    restore.atime = new Date(restore.atime);
    assertNumber(restore.mtime);
    restore.mtime = new Date(restore.mtime);
    assertNumber(restore.ctime);
    restore.ctime = new Date(restore.ctime);
    assertNumber(restore.birthtime);
    restore.birthtime = new Date(restore.birthtime);

    restore.isFile = function () {
      return this.isFileValue;
    };
    restore.isDirectory = function () {
      return this.isDirectoryValue;
    };
    restore.isSymbolicLink = function () {
      return false;
    };
    restore.isFIFO = function () {
      return false;
    };
  }

  function findNativeAddonForStat (path_) {
    var path = findNativeAddon(path_);
    if (!path) throw error_ENOENT('File or directory', path_);
    return ancestor.statSync.call(fs, path);
  }

  function statFromSnapshot (path_) {
    var path = normalizePath(path_);
    // console.log("statFromSnapshot", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return findNativeAddonForStat(path);
    var entityStat = entity[STORE_STAT];
    if (!entityStat) throw new Error('UNEXPECTED-35');
    var restore = JSON.parse(JSON.stringify(entityStat)); // clone to prevent mutating store
    restoreStat(restore);
    return restore;
  }

  fs.statSync = function (path) {
    if (!insideSnapshot(path)) {
      return ancestor.statSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.statSync.apply(fs, translateNth(arguments, 0, path));
    }

    return statFromSnapshot(path);
  };

  fs.stat = function (path) {
    if (!insideSnapshot(path)) {
      return ancestor.stat.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.stat.apply(fs, translateNth(arguments, 0, path));
    }

    var callback = maybeCallback(arguments);
    try {
      var r = statFromSnapshot(path);
      process.nextTick(function () {
        callback(null, r);
      });
    } catch (error) {
      process.nextTick(function () {
        callback(error);
      });
    }
  };

  // ///////////////////////////////////////////////////////////////
  // lstat /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  fs.lstatSync = function (path) {
    if (!insideSnapshot(path)) {
      return ancestor.lstatSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.lstatSync.apply(fs, translateNth(arguments, 0, path));
    }

    return statFromSnapshot(path);
  };

  fs.lstat = function (path) {
    if (!insideSnapshot(path)) {
      return ancestor.lstat.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.lstat.apply(fs, translateNth(arguments, 0, path));
    }

    var callback = maybeCallback(arguments);
    try {
      var r = statFromSnapshot(path);
      process.nextTick(function () {
        callback(null, r);
      });
    } catch (error) {
      process.nextTick(function () {
        callback(error);
      });
    }
  };

  // ///////////////////////////////////////////////////////////////
  // fstat /////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function fstatFromSnapshot (fd) {
    var dock = docks[fd];
    var entity = dock.entity;
    var entityStat = entity[STORE_STAT];
    if (!entityStat) throw new Error('UNEXPECTED-40');
    var restore = JSON.parse(JSON.stringify(entityStat)); // clone to prevent mutating store
    restoreStat(restore);
    return restore;
  }

  fs.fstatSync = function (fd) {
    if (!docks[fd]) {
      return ancestor.fstatSync.apply(fs, arguments);
    }

    return fstatFromSnapshot(fd);
  };

  fs.fstat = function (fd) {
    if (!docks[fd]) {
      return ancestor.fstat.apply(fs, arguments);
    }

    var callback = maybeCallback(arguments);
    try {
      var r = fstatFromSnapshot(fd);
      process.nextTick(function () {
        callback(null, r);
      });
    } catch (error) {
      process.nextTick(function () {
        callback(error);
      });
    }
  };

  // ///////////////////////////////////////////////////////////////
  // exists ////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function existsFromSnapshot (path_) {
    var path = normalizePath(path_);
    // console.log("existsFromSnapshot", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return false;
    return true;
  }

  fs.existsSync = function (path) {
    if (!insideSnapshot(path)) {
      return ancestor.existsSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.existsSync.apply(fs, translateNth(arguments, 0, path));
    }

    return existsFromSnapshot(path);
  };

  fs.exists = function (path) {
    if (!insideSnapshot(path)) {
      return ancestor.exists.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.exists.apply(fs, translateNth(arguments, 0, path));
    }

    var callback = maybeCallback(arguments);
    var r = existsFromSnapshot(path);
    process.nextTick(function () {
      callback(r);
    });
  };

  // ///////////////////////////////////////////////////////////////
  // access ////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function accessFromSnapshot (path_) {
    var path = normalizePath(path_);
    // console.log("accessFromSnapshot", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) throw error_ENOENT('File or directory', path);
    return undefined;
  }

  fs.accessSync = function (path) {
    if (!insideSnapshot(path)) {
      return ancestor.accessSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.accessSync.apply(fs, translateNth(arguments, 0, path));
    }

    return accessFromSnapshot(path);
  };

  fs.access = function (path) {
    if (!insideSnapshot(path)) {
      return ancestor.access.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.access.apply(fs, translateNth(arguments, 0, path));
    }

    var callback = maybeCallback(arguments);
    try {
      var r = accessFromSnapshot(path);
      process.nextTick(function () {
        callback(null, r);
      });
    } catch (error) {
      process.nextTick(function () {
        callback(error);
      });
    }
  };

  // ///////////////////////////////////////////////////////////////
  // INTERNAL //////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function makeLong (f) {
    return require('path')._makeLong(f);
  }

  function revertMakingLong (f) {
    if (/^\\\\\?\\/.test(f)) return f.slice(4);
    return f;
  }

  function findNativeAddonForInternalModuleStat (path_) {
    var path = findNativeAddon(path_);
    if (!path) return -ENOENT;
    return process.binding('fs').internalModuleStat(makeLong(path));
  }

  fs.internalModuleStat = function (long) {
    // from node comments:
    // Used to speed up module loading. Returns 0 if the path refers to
    // a file, 1 when it's a directory or < 0 on error (usually -ENOENT).
    // The speedup comes from not creating thousands of Stat and Error objects.

    var path = revertMakingLong(long);

    if (!insideSnapshot(path)) {
      return process.binding('fs').internalModuleStat(long);
    }
    if (insideMountpoint(path)) {
      return process.binding('fs').internalModuleStat(makeLong(translate(path)));
    }

    path = normalizePath(path);
    // console.log("internalModuleStat", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return findNativeAddonForInternalModuleStat(path);
    var entityStat = entity[STORE_STAT];
    if (!entityStat) return -ENOENT;
    if (entityStat.isFileValue) return 0;
    if (entityStat.isDirectoryValue) return 1;
    return -ENOENT;
  };

  fs.internalModuleReadFile = function (long) {
    // from node comments:
    // Used to speed up module loading. Returns the contents of the file as
    // a string or undefined when the file cannot be opened. The speedup
    // comes from not creating Error objects on failure.

    var path = revertMakingLong(long);

    if (!insideSnapshot(path)) {
      return process.binding('fs').internalModuleReadFile(long);
    }
    if (insideMountpoint(path)) {
      return process.binding('fs').internalModuleReadFile(makeLong(translate(path)));
    }

    path = normalizePath(path);
    // console.log("internalModuleReadFile", path);
    var entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return undefined;
    var entityContent = entity[STORE_CONTENT];
    if (!Buffer.isBuffer(entityContent)) return undefined;
    return entityContent.toString();
  };
}());

// /////////////////////////////////////////////////////////////////
// PATCH MODULE ////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(function () {
  var Module = require('module');
  var ancestor = {};
  ancestor.require =          Module.prototype.require;
  ancestor._compile =         Module.prototype._compile;
  ancestor._resolveFilename = Module._resolveFilename;
  ancestor._node =            Module._extensions['.node'];
  ancestor.runMain =          Module.runMain;

  Module.prototype.require = function (path) {
    try {
      return ancestor.require.apply(this, arguments);
    } catch (error) {
      if (((error.code === 'ENOENT') ||
           (error.code === 'MODULE_NOT_FOUND')) &&
          (!insideSnapshot(path)) &&
          (!require('path').isAbsolute(path))) {
        if (!error.pkg) {
          error.pkg = true;
          error.message += '\n' +
            '1) If you want to compile the package/file into ' +
            'executable, please pay attention to compilation ' +
            'warnings and specify a literal in \'require\' call. ' +
            '2) If you don\'t want to compile the package/file ' +
            'into executable and want to \'require\' it from ' +
            'filesystem (likely plugin), specify an absolute ' +
            'path in \'require\' call using process.cwd() or ' +
            'process.execPath.';
        }
      }
      throw error;
    }
  };

  var makeRequireFunction;

  if (NODE_VERSION_MAJOR === 0) {
    makeRequireFunction = function () {
      var self = this; // eslint-disable-line consistent-this,no-invalid-this
      function rqfn (path) {
        return self.require(path);
      }
      rqfn.resolve = function (request) {
        return Module._resolveFilename(request, self);
      };
      rqfn.main = process.mainModule;
      rqfn.extensions = Module._extensions;
      rqfn.cache = Module._cache;
      return rqfn;
    };
  } else {
    makeRequireFunction = (
      require('internal/module').makeRequireFunction
    );
  }

  Module.prototype._compile = function (content, filename_) {
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
      // var user try to "_compile" a packaged file
      return ancestor._compile.apply(this, arguments);
    }

    var entityCode = entity[STORE_CODE];
    var entityContent = entity[STORE_CONTENT];

    if (entityCode) {
      if (entityContent) throw new Error('UNEXPECTED-45');
      var dirname = require('path').dirname(filename);
      var rqfn = makeRequireFunction.call(this);
      var args = [ this.exports, rqfn, this, filename, dirname ];
      return entityCode.apply(this.exports, args);
    }

    if (entityContent) {
      if (entityCode) throw new Error('UNEXPECTED-50');
      // content is already in utf8 and without BOM (that is expected
      // by stock _compile), but entityContent is still a Buffer
      return ancestor._compile.apply(this, arguments);
    }

    throw new Error('UNEXPECTED-55');
  };

  Module._resolveFilename = function (request) {
    var filename;

    var reqDotNode = (request.slice(-5) === '.node'); // bindings.js: opts.bindings += '.node'
    var reqLeftSlash = (request.indexOf('\\') >= 0);  // heapdump: require('../build/Release/addon')
    var reqRightSlash = (request.indexOf('/') >= 0);  // slash means that non-package is required ...
    var enable = reqDotNode || reqLeftSlash || reqRightSlash; // ... (had a problem in levelup/pouchdb)

    FLAG_DISABLE_DOT_NODE = !enable;
    try {
      filename = ancestor._resolveFilename.apply(null, arguments);
    } finally {
      FLAG_DISABLE_DOT_NODE = false;
    }

    if (!insideSnapshot(filename)) {
      return filename;
    }
    if (insideMountpoint(filename)) {
      return filename;
    }

    var found = findNativeAddon(filename);
    if (found) filename = found;

    return filename;
  };

  Module._extensions['.node'] = function (module, filename_) {
    var filename = filename_;

    if (!insideSnapshot(filename)) {
      try {
        return ancestor._node.call(null, module, filename);
      } catch (error) {
        filename = modifyNativeAddonWin32(filename);
        return ancestor._node.call(null, module, filename);
      }
    }
    if (insideMountpoint(filename)) {
      try {
        return ancestor._node.call(null, module, translate(filename));
      } catch (error) {
        filename = modifyNativeAddonWin32(filename);
        return ancestor._node.call(null, module, translate(filename));
      }
    }

    try {
      return ancestor._node.call(null, module, filename);
    } catch (error) {
      filename = modifyNativeAddonWin32(filename);
      return ancestor._node.call(null, module, filename);
    }
  };

  Module.runMain = function () {
    Module._load(ENTRYPOINT, null, true);
    process._tickCallback();
  };
}());

// /////////////////////////////////////////////////////////////////
// PATCH CLUSTER ///////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(function () {
  var cluster = require('cluster');
  var ancestor = {};
  ancestor.fork = cluster.fork;

  if (ancestor.fork) {
    cluster.fork = function () {
      FLAG_FORK_WAS_CALLED = true;
      try {
        return ancestor.fork.apply(cluster, arguments);
      } finally {
        FLAG_FORK_WAS_CALLED = false;
      }
    };
  }
}());

// /////////////////////////////////////////////////////////////////
// PATCH CHILD_PROCESS /////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(function () {
  var childProcess = require('child_process');
  var ancestor = {};
  ancestor.fork = childProcess.fork;
  ancestor.spawn = childProcess.spawn;

  childProcess.fork = function () {
    FLAG_FORK_WAS_CALLED = true;
    try {
      return ancestor.fork.apply(childProcess, arguments);
    } finally {
      FLAG_FORK_WAS_CALLED = false;
    }
  };

  function filterBadOptions (args) {
    return args.filter(function (arg) {
      var name = arg.split('=')[0];
      return name !== '--debug-port';
    });
  }

  function makeRuntimeArgs (args) {
    var noBad = filterBadOptions(args);
    if (!noBad.length) return [];
    return [ '--runtime' ].concat(noBad);
  }

  function rearrangeFork (args) {
    var scriptPos = -1;
    for (var i = 0; i < args.length; i += 1) {
      if (args[i].slice(0, 2) !== '--') {
        scriptPos = i;
        break;
      }
    }
    if (scriptPos === -1) {
      // i dont know this case,
      // but all options start with "--"
      // hence they are runtime opts
      return makeRuntimeArgs(args);
    } else
    if (args[scriptPos] === process.argv[1]) {
      // cluster calls "execPath" with process.argv[1]
      // see "cluster.settings.exec = argv[1]"
      // i must skip entrypoint to use default one
      return [].concat(
        args.slice(scriptPos + 1)
      ).concat(
        makeRuntimeArgs(
          args.slice(0, scriptPos)
        )
      );
    } else {
      return [].concat([
        '--entrypoint',
        args[scriptPos]
      ]).concat(
        args.slice(scriptPos + 1)
      ).concat(
        makeRuntimeArgs(
          args.slice(0, scriptPos)
        )
      );
    }
  }

  function rearrangeSpawn (args) {
    var scriptPos = 0;
    if (args[scriptPos] === process.argv[1]) {
      return [].concat(
        args.slice(scriptPos + 1)
      );
    } else {
      return [].concat(args);
    }
  }

  function extractEntrypoint (args) {
    var i = args.indexOf('--entrypoint');
    if (i < 0) return null;
    return args[i + 1];
  }

  childProcess.spawn = function () {
    var args = cloneArgs(arguments);

    if ((args[0] && args[1] &&
         args[1].unshift && args[2])) {
      var callsNode = (args[0] === 'node');
      var callsExecPath = (args[0] === process.execPath);
      var callsArgv1 = (args[0] === process.argv[1]);

      if (callsNode || callsExecPath) {
        if (FLAG_FORK_WAS_CALLED) {
          args[1] = rearrangeFork(args[1]);
        } else {
          args[1] = rearrangeSpawn(args[1]);
        }

        var entrypoint = extractEntrypoint(args[1]);
        if (callsNode && insideSnapshot(entrypoint)) {
          // pm2 calls "node" with __dirname-based
          // snapshot-script. force execPath instead of "node"
          args[0] = process.execPath;
        }
      } else
      if (callsArgv1) {
        args[0] = process.execPath;
      }
    }

    return ancestor.spawn.apply(childProcess, args);
  };
}());

// /////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

/*

    // TODO move to some test

    assert(JSON.stringify(rearrange([
      "/home/igor/script.js"
    ])) === JSON.stringify([
      "--entrypoint",
      "/home/igor/script.js"
    ]));

    assert(JSON.stringify(rearrange([
      "/snapshot/home/igor/script.js"
    ])) === JSON.stringify([
      "--entrypoint",
      "/snapshot/home/igor/script.js"
    ]));

    assert(JSON.stringify(rearrange([
      "--node-opt-01",
      "/snapshot/home/igor/script.js"
    ])) === JSON.stringify([
      "--entrypoint",
      "/snapshot/home/igor/script.js",
      "--runtime",
      "--node-opt-01"
    ]));

    assert(JSON.stringify(rearrange([
      "--node-opt-01",
      "--node-opt-02",
      "/snapshot/home/igor/script.js"
    ])) === JSON.stringify([
      "--entrypoint",
      "/snapshot/home/igor/script.js",
      "--runtime",
      "--node-opt-01",
      "--node-opt-02"
    ]));

    assert(JSON.stringify(rearrange([
      "/snapshot/home/igor/script.js",
      "app-opt-01",
      "app-opt-02"
    ])) === JSON.stringify([
      "--entrypoint",
      "/snapshot/home/igor/script.js",
      "app-opt-01",
      "app-opt-02"
    ]));

    assert(JSON.stringify(rearrange([
      "--node-opt-01",
      "--node-opt-02",
      "/snapshot/home/igor/script.js",
      "app-opt-01",
      "app-opt-02"
    ])) === JSON.stringify([
      "--entrypoint",
      "/snapshot/home/igor/script.js",
      "app-opt-01",
      "app-opt-02",
      "--runtime",
      "--node-opt-01",
      "--node-opt-02"
    ]));

    assert(JSON.stringify(rearrange([
      process["argv"][1]
    ])) === JSON.stringify([
    ]));

    assert(JSON.stringify(rearrange([
      "--node-opt-01",
      process["argv"][1]
    ])) === JSON.stringify([
      "--runtime",
      "--node-opt-01"
    ]));

    assert(JSON.stringify(rearrange([
      "--node-opt-01",
      "--node-opt-02",
      process["argv"][1]
    ])) === JSON.stringify([
      "--runtime",
      "--node-opt-01",
      "--node-opt-02"
    ]));

    assert(JSON.stringify(rearrange([
      process["argv"][1],
      "app-opt-01",
      "app-opt-02"
    ])) === JSON.stringify([
      "app-opt-01",
      "app-opt-02"
    ]));

    assert(JSON.stringify(rearrange([
      "--node-opt-01",
      "--node-opt-02",
      process["argv"][1],
      "app-opt-01",
      "app-opt-02"
    ])) === JSON.stringify([
      "app-opt-01",
      "app-opt-02",
      "--runtime",
      "--node-opt-01",
      "--node-opt-02"
    ]));

*/
