/* eslint-disable no-bitwise */
/* eslint-disable no-multi-spaces */
/* eslint-enable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */

/* global REQUIRE_COMMON */
/* global VIRTUAL_FILESYSTEM */
/* global DEFAULT_ENTRYPOINT */

'use strict';

let common = {};
REQUIRE_COMMON(common); // eslint-disable-line new-cap

let STORE_CODE = common.STORE_CODE;
let STORE_CONTENT = common.STORE_CONTENT;
let STORE_LINKS = common.STORE_LINKS;
let STORE_STAT = common.STORE_STAT;

let normalizePath = common.normalizePath;
let insideTheBox = common.insideTheBox;
let stripTheBox = common.stripTheBox;

let ENTRYPOINT;
let FLAG_FORK_WAS_CALLED = false;
let FLAG_DISABLE_DOT_NODE = false;
let NODE_VERSION = process.version;
if (NODE_VERSION.slice(0, 1) === 'v') NODE_VERSION = NODE_VERSION.slice(1);
let NODE_VERSION_MAJOR = NODE_VERSION.split('.')[0] | 0;

// /////////////////////////////////////////////////////////////////
// ENTRYPOINT //////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

ENTRYPOINT = process.argv[1];
if (ENTRYPOINT === 'DEFAULT_ENTRYPOINT') {
  ENTRYPOINT = DEFAULT_ENTRYPOINT;
}

if (!insideTheBox(ENTRYPOINT)) {
  // fallback to plain node. need to revert patch to node/lib/module.js
  require('fs').internalModuleStat =     process.binding('fs').internalModuleStat;
  require('fs').internalModuleReadFile = process.binding('fs').internalModuleReadFile;
  return;
}

// /////////////////////////////////////////////////////////////////
// MOUNTPOINTS /////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

let mountpoints = [];

function insideMountpoint (f) {
  if (!insideTheBox(f)) return null;
  let file = normalizePath(f);
  let found = mountpoints.map(function (mountpoint) {
    let interior = mountpoint.interior;
    let exterior = mountpoint.exterior;
    if (interior === file) return exterior;
    let left = interior + require('path').sep;
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
  let result = insideMountpoint(f);
  if (!result) throw new Error('UNEXPECTED-05');
  return result;
}

function cloneArgs (args_) {
  return Array.prototype.slice.call(args_);
}

function translateNth (args_, index, f) {
  let args = cloneArgs(args_);
  args[index] = translate(f);
  return args;
}

function createMountpoint (interior, exterior) {
  // TODO validate
  mountpoints.push({ interior: interior, exterior: exterior });
}

/*

// TODO move to some test

createMountpoint("d:\\thebox\\countly\\plugins-ext", "d:\\deploy\\countly\\v16.02\\plugins-ext");

console.log(insideMountpoint("d:\\thebox"));
console.log(insideMountpoint("d:\\thebox\\"));
console.log(insideMountpoint("d:\\thebox\\countly"));
console.log(insideMountpoint("d:\\thebox\\countly\\"));
console.log(insideMountpoint("d:\\thebox\\countly\\plugins-ext"));
console.log(insideMountpoint("d:\\thebox\\countly\\plugins-ext\\"));
console.log(insideMountpoint("d:\\thebox\\countly\\plugins-ext\\1234"));

console.log(translate("d:\\thebox\\countly\\plugins-ext"));
console.log(translate("d:\\thebox\\countly\\plugins-ext\\"));
console.log(translate("d:\\thebox\\countly\\plugins-ext\\1234"));

console.log(translateNth([], 0, "d:\\thebox\\countly\\plugins-ext"));
console.log(translateNth([], 0, "d:\\thebox\\countly\\plugins-ext\\"));
console.log(translateNth([], 0, "d:\\thebox\\countly\\plugins-ext\\1234"));

console.log(translateNth(["", "r+"], 0, "d:\\thebox\\countly\\plugins-ext"));
console.log(translateNth(["", "rw"], 0, "d:\\thebox\\countly\\plugins-ext\\"));
console.log(translateNth(["", "a+"], 0, "d:\\thebox\\countly\\plugins-ext\\1234"));
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
  if (!insideTheBox(path)) throw new Error('UNEXPECTED-10');
  if (path.slice(-5) !== '.node') return null; // leveldown.node.js
  let projector = projectToFilesystem(path);
  if (require('fs').existsSync(projector)) return projector;
  if (FLAG_DISABLE_DOT_NODE) return null; // FLAG influences only nearby
  projector = projectToNearby(path);
  if (require('fs').existsSync(projector)) return projector;
  return null;
}

// /////////////////////////////////////////////////////////////////
// NATIVE ADDON IAT ////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

let modifyNativeAddonWin32 = (function () {

  let fs = require('fs');

  return function (addon) {

    let modifiedAddon;

    let newExeName = require('path').basename(process.execPath);
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

    let f = fs.readFileSync(addon);
    let peHeader = f.readInt32LE(0x3C);
    let numberOfSections = f.readInt16LE(peHeader + 0x06);
    let ia32 = (f.readInt16LE(peHeader + 0x18) !== 0x020B); // ia32 or x64
    let optHeaderSize = f.readInt16LE(peHeader + 0x14);
    let firstSection = peHeader + 0x18 + optHeaderSize;

    function readStringToZero (p_) {
      if (p_ === 0) return '';
      let s = '', c, p = p_;
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
      let b = (new Buffer(s + '\x00'));
      b.copy(f, p);
      return b.length;
    }

    let sections = [];

    (function () {
      let pos = firstSection, section;
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
      let result = null;
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
      let section = rva2section(rva);
      return rva - section.virtualAddress + section.rawAddress;
    }

    function raw2rva (raw, section) {
      return raw + section.virtualAddress - section.rawAddress;
    }

    let firstRva = f.readInt32LE(peHeader + (ia32 ? 0x80 : 0x90));
    let firstRaw = rva2raw(firstRva);

    let imps = [];

    (function () {
      let pos = firstRaw, imp;
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

      let firstThunkRaw = imp.firstThunkRaw;

      let thunks = [];
      (function () {
        let posLink = firstThunkRaw;
        let pos, posHi, posRva, posRaw, thunk;
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

    let impNode = imps.filter(function (imp) {
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

    let placeSection = impNode.name.section;
    let place = placeSection.rawAddress + placeSection.virtualSize;
    let written = writeString(place, newExeName);
    placeSection.virtualSize += written;
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

  process.enclose = {};
  process.argv[1] = process.execPath;
  process.versions.enclose = '2.2.0';
  process.enclose.mount = createMountpoint;
  process.enclose.DEFAULT_ENTRYPOINT = DEFAULT_ENTRYPOINT;

}());

// /////////////////////////////////////////////////////////////////
// PATH.RESOLVE REPLACEMENT ////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(function () {

  let path = require('path');

  process.enclose.path = {};
  process.enclose.path.resolve = function () {
    let args = cloneArgs(arguments);
    args.unshift(path.dirname(ENTRYPOINT));
    return path.resolve.apply(path, args);
  };

}());

// /////////////////////////////////////////////////////////////////
// PATCH FS ////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(function () {

  let fs = require('fs');
  let ancestor = {};
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

  let windows = process.platform === 'win32';

  let docks = {};
  let ENOTDIR = windows ? 4052 : 20;
  let ENOENT = windows ? 4058 : 2;
  let EISDIR = windows ? 4068 : 21;

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
    let cb = args[args.length - 1];
    return typeof cb === 'function' ? cb : rethrow();
  }

  function error_ENOENT (fileOrDirectory, path) { // eslint-disable-line camelcase
    let error = new Error(
      fileOrDirectory + ' \'' + stripTheBox(path) + '\' ' +
      'was not included into executable at compilation stage. ' +
      'Please recompile adding it as asset or script.'
    );
    error.errno = -ENOENT;
    error.code = 'ENOENT';
    error.path = path;
    error.enclose = true;
    return error;
  }

  function error_EISDIR (path) { // eslint-disable-line camelcase
    let error = new Error(
      'EISDIR: illegal operation on a directory, read'
    );
    error.errno = -EISDIR;
    error.code = 'EISDIR';
    error.path = path;
    error.enclose = true;
    return error;
  }

  function error_ENOTDIR (path) { // eslint-disable-line camelcase
    let error = new Error(
      'ENOTDIR: not a directory, scandir \'' + path + '\''
    );
    error.errno = -ENOTDIR;
    error.code = 'ENOTDIR';
    error.path = path;
    error.enclose = true;
    return error;
  }

  // ///////////////////////////////////////////////////////////////
  // open //////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function openFromTheBox (path_) {

    let path = normalizePath(path_);
    // console.log("openFromTheBox", path);
    let entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) throw error_ENOENT('File or directory', path);
    let nullDevice = windows ? '\\\\.\\NUL' : '/dev/null';
    let fd = ancestor.openSync.call(fs, nullDevice, 'r');
    let dock = docks[fd] = {};
    dock.fd = fd;
    dock.path = path;
    dock.entity = entity;
    dock.position = 0;
    return fd;

  }

  fs.openSync = function (path) {

    if (!insideTheBox(path)) {
      return ancestor.openSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.openSync.apply(fs, translateNth(arguments, 0, path));
    }

    return openFromTheBox(path);

  };

  fs.open = function (path) {

    if (!insideTheBox(path)) {
      return ancestor.open.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.open.apply(fs, translateNth(arguments, 0, path));
    }

    let callback = maybeCallback(arguments);
    try {
      let r = openFromTheBox(path);
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

  function readFromTheBoxSub (dock, entityContent, buffer, offset, length, position) {

    let p = position;
    if ((p === null) || (typeof p === 'undefined')) p = dock.position;
    if (p >= entityContent.length) return 0;
    let end = p + length;
    let result = entityContent.copy(buffer, offset, p, end);
    dock.position = end;
    return result;

  }

  function readFromTheBox (fd, buffer, offset, length, position) {

    if (offset < 0) throw new Error('Offset is out of bounds');
    if ((offset >= buffer.length) && (NODE_VERSION_MAJOR >= 6)) return 0;
    if (offset >= buffer.length) throw new Error('Offset is out of bounds');
    if (offset + length > buffer.length) throw new Error('Length extends beyond buffer');

    let dock = docks[fd];
    let entity = dock.entity;
    let entityContent = entity[STORE_CONTENT];
    if (entityContent) return readFromTheBoxSub(dock, entityContent, buffer, offset, length, position);
    let entityLinks = entity[STORE_LINKS];
    if (entityLinks) throw error_EISDIR(dock.path);
    throw new Error('UNEXPECTED-15');

  }

  fs.readSync = function (fd, buffer, offset, length, position) {

    if (!docks[fd]) {
      return ancestor.readSync.apply(fs, arguments);
    }

    return readFromTheBox(fd, buffer, offset, length, position);

  };

  fs.read = function (fd, buffer, offset, length, position) {

    if (!docks[fd]) {
      return ancestor.read.apply(fs, arguments);
    }

    let callback = maybeCallback(arguments);
    try {
      let r = readFromTheBox(
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

  function writeToTheBox () {

    throw new Error('Cannot write to packaged file');

  }

  fs.writeSync = function (fd) {

    if (!docks[fd]) {
      return ancestor.writeSync.apply(fs, arguments);
    }

    return writeToTheBox();

  };

  fs.write = function (fd, buffer) {

    if (!docks[fd]) {
      return ancestor.write.apply(fs, arguments);
    }

    let callback = maybeCallback(arguments);
    try {
      let r = writeToTheBox();
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

  function closeFromTheBox (fd) {

    ancestor.closeSync.call(fs, fd);
    delete docks[fd];

  }

  fs.closeSync = function (fd) {

    if (!docks[fd]) {
      return ancestor.closeSync.apply(fs, arguments);
    }

    return closeFromTheBox(fd);

  };

  fs.close = function (fd) {

    if (!docks[fd]) {
      return ancestor.close.apply(fs, arguments);
    }

    let callback = maybeCallback(arguments);
    try {
      let r = closeFromTheBox(fd);
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
    } else if (typeof options !== 'object') {
      return null;
    }
  }

  function readFileFromTheBox (path_) {

    let path = normalizePath(path_);
    // console.log("readFileFromTheBox", path);
    let entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) throw error_ENOENT('File', path);
    let entityCode = entity[STORE_CODE];
    if (entityCode) return new Buffer('source-code-not-available');

    // why return empty buffer?
    // otherwise this error will arise:
    // Error: UNEXPECTED-20
    //     at readFileFromTheBox (e:0)
    //     at Object.fs.readFileSync (e:0)
    //     at Object.Module._extensions..js (module.js:421:20)
    //     at Module.load (module.js:357:32)
    //     at Function.Module._load (module.js:314:12)
    //     at Function.Module.runMain (e:0)
    //     at startup (node.js:140:18)
    //     at node.js:1001:3

    let entityContent = entity[STORE_CONTENT];
    if (entityContent) return new Buffer(entityContent); // clone to prevent mutating store
    let entityLinks = entity[STORE_LINKS];
    if (entityLinks) throw error_EISDIR(path);
    throw new Error('UNEXPECTED-20');

  }

  fs.readFileSync = function (path, options_) {

    if (path === 'dirty-hack-for-testing-purposes') {
      return path;
    }

    if (!insideTheBox(path)) {
      return ancestor.readFileSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.readFileSync.apply(fs, translateNth(arguments, 0, path));
    }

    let options = readFileOptions(options_, false);

    if (!options) {
      return ancestor.readFileSync.apply(fs, arguments);
    }

    let encoding = options.encoding;
    assertEncoding(encoding);
    let buffer = readFileFromTheBox(path);
    if (encoding) buffer = buffer.toString(encoding);
    return buffer;

  };

  fs.readFile = function (path, options_) {

    if (!insideTheBox(path)) {
      return ancestor.readFile.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.readFile.apply(fs, translateNth(arguments, 0, path));
    }

    let options = readFileOptions(options_, true);

    if (!options) {
      return ancestor.readFile.apply(fs, arguments);
    }

    let encoding = options.encoding;
    assertEncoding(encoding);

    let callback = maybeCallback(arguments);
    try {
      let buffer = readFileFromTheBox(path);
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

  function readdirFromTheBox (path_) {

    let path = normalizePath(path_);
    // console.log("readdirFromTheBox", path);
    let entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) throw error_ENOENT('Directory', path);
    let entityLinks = entity[STORE_LINKS];
    if (entityLinks) return entityLinks.concat(readdirMountpoints(path)); // immutable concat to prevent mutating store
    let entityCode = entity[STORE_CODE];
    if (entityCode) throw error_ENOTDIR(path);
    let entityContent = entity[STORE_CONTENT];
    if (entityContent) throw error_ENOTDIR(path);
    throw new Error('UNEXPECTED-25');

  }

  fs.readdirSync = function (path) {

    if (!insideTheBox(path)) {
      return ancestor.readdirSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.readdirSync.apply(fs, translateNth(arguments, 0, path));
    }

    return readdirFromTheBox(path);

  };

  fs.readdir = function (path) {

    if (!insideTheBox(path)) {
      return ancestor.readdir.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.readdir.apply(fs, translateNth(arguments, 0, path));
    }

    let callback = maybeCallback(arguments);
    try {
      let r = readdirFromTheBox(path);
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

  function realpathFromTheBox (path_) {

    let path = normalizePath(path_);
    // console.log("realpathFromTheBox", path);
    return path;

  }

  fs.realpathSync = function (path) {

    if (!insideTheBox(path)) {
      return ancestor.realpathSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      // app should not know real file name
    }

    return realpathFromTheBox(path);

  };

  fs.realpath = function (path) {

    if (!insideTheBox(path)) {
      return ancestor.realpath.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      // app should not know real file name
    }

    let callback = maybeCallback(arguments);
    let r = realpathFromTheBox(path);
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
    let path = findNativeAddon(path_);
    if (!path) throw error_ENOENT('File or directory', path_);
    return ancestor.statSync.call(fs, path);
  }

  function statFromTheBox (path_) {

    let path = normalizePath(path_);
    // console.log("statFromTheBox", path);
    let entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return findNativeAddonForStat(path);
    let entityStat = entity[STORE_STAT];
    if (!entityStat) throw new Error('UNEXPECTED-35');
    let restore = JSON.parse(JSON.stringify(entityStat)); // clone to prevent mutating store
    restoreStat(restore);
    return restore;

  }

  fs.statSync = function (path) {

    if (!insideTheBox(path)) {
      return ancestor.statSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.statSync.apply(fs, translateNth(arguments, 0, path));
    }

    return statFromTheBox(path);

  };

  fs.stat = function (path) {

    if (!insideTheBox(path)) {
      return ancestor.stat.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.stat.apply(fs, translateNth(arguments, 0, path));
    }

    let callback = maybeCallback(arguments);
    try {
      let r = statFromTheBox(path);
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

    if (!insideTheBox(path)) {
      return ancestor.lstatSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.lstatSync.apply(fs, translateNth(arguments, 0, path));
    }

    return statFromTheBox(path);

  };

  fs.lstat = function (path) {

    if (!insideTheBox(path)) {
      return ancestor.lstat.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.lstat.apply(fs, translateNth(arguments, 0, path));
    }

    let callback = maybeCallback(arguments);
    try {
      let r = statFromTheBox(path);
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

  function fstatFromTheBox (fd) {

    let dock = docks[fd];
    let entity = dock.entity;
    let entityStat = entity[STORE_STAT];
    if (!entityStat) throw new Error('UNEXPECTED-40');
    let restore = JSON.parse(JSON.stringify(entityStat)); // clone to prevent mutating store
    restoreStat(restore);
    return restore;

  }

  fs.fstatSync = function (fd) {

    if (!docks[fd]) {
      return ancestor.fstatSync.apply(fs, arguments);
    }

    return fstatFromTheBox(fd);

  };

  fs.fstat = function (fd) {

    if (!docks[fd]) {
      return ancestor.fstat.apply(fs, arguments);
    }

    let callback = maybeCallback(arguments);
    try {
      let r = fstatFromTheBox(fd);
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

  function existsFromTheBox (path_) {

    let path = normalizePath(path_);
    // console.log("existsFromTheBox", path);
    let entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return false;
    return true;

  }

  fs.existsSync = function (path) {

    if (!insideTheBox(path)) {
      return ancestor.existsSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.existsSync.apply(fs, translateNth(arguments, 0, path));
    }

    return existsFromTheBox(path);

  };

  fs.exists = function (path) {

    if (!insideTheBox(path)) {
      return ancestor.exists.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.exists.apply(fs, translateNth(arguments, 0, path));
    }

    let callback = maybeCallback(arguments);
    let r = existsFromTheBox(path);
    process.nextTick(function () {
      callback(r);
    });

  };

  // ///////////////////////////////////////////////////////////////
  // access ////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////

  function accessFromTheBox (path_) {

    let path = normalizePath(path_);
    // console.log("accessFromTheBox", path);
    let entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) throw error_ENOENT('File or directory', path);
    return undefined; // eslint-disable-line no-undefined

  }

  fs.accessSync = function (path) {

    if (!insideTheBox(path)) {
      return ancestor.accessSync.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.accessSync.apply(fs, translateNth(arguments, 0, path));
    }

    return accessFromTheBox(path);

  };

  fs.access = function (path) {

    if (!insideTheBox(path)) {
      return ancestor.access.apply(fs, arguments);
    }
    if (insideMountpoint(path)) {
      return ancestor.access.apply(fs, translateNth(arguments, 0, path));
    }

    let callback = maybeCallback(arguments);
    try {
      let r = accessFromTheBox(path);
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
    let path = findNativeAddon(path_);
    if (!path) return -ENOENT;
    return process.binding('fs').internalModuleStat(makeLong(path));
  }

  fs.internalModuleStat = function (long) {

    // from node comments:
    // Used to speed up module loading. Returns 0 if the path refers to
    // a file, 1 when it's a directory or < 0 on error (usually -ENOENT).
    // The speedup comes from not creating thousands of Stat and Error objects.

    let path = revertMakingLong(long);

    if (!insideTheBox(path)) {
      return process.binding('fs').internalModuleStat(long);
    }
    if (insideMountpoint(path)) {
      return process.binding('fs').internalModuleStat(makeLong(translate(path)));
    }

    path = normalizePath(path);
    // console.log("internalModuleStat", path);
    let entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return findNativeAddonForInternalModuleStat(path);
    let entityStat = entity[STORE_STAT];
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

    let path = revertMakingLong(long);

    if (!insideTheBox(path)) {
      return process.binding('fs').internalModuleReadFile(long);
    }
    if (insideMountpoint(path)) {
      return process.binding('fs').internalModuleReadFile(makeLong(translate(path)));
    }

    path = normalizePath(path);
    // console.log("internalModuleReadFile", path);
    let entity = VIRTUAL_FILESYSTEM[path];
    if (!entity) return undefined; // eslint-disable-line no-undefined
    let entityContent = entity[STORE_CONTENT];
    if (!Buffer.isBuffer(entityContent)) return undefined; // eslint-disable-line no-undefined
    return entityContent.toString();

  };

}());

// /////////////////////////////////////////////////////////////////
// PATCH MODULE ////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////

(function () {

  let Module = require('module');
  let ancestor = {};
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
          (!insideTheBox(path)) &&
          (!require('path').isAbsolute(path))) {
        if (!error.enclose) {
          error.enclose = true;
          error.message += '\n' +
            '1) If you want to enclose the package/file into ' +
            'executable, please pay attention to compilation ' +
            'warnings and specify a literal in \'require\' call. ' +
            '2) If you don\'t want to enclose the package/file ' +
            'into executable and want to \'require\' it from ' +
            'filesystem (likely plugin), specify an absolute ' +
            'path in \'require\' call using process.cwd() or ' +
            'process.argv[1].';
        }
      }
      throw error;
    }
  };

  let makeRequireFunction;

  if (NODE_VERSION_MAJOR === 0) {
    makeRequireFunction = function () {
      let self = this; // eslint-disable-line consistent-this,no-invalid-this
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

    if (!insideTheBox(filename_)) {
      return ancestor._compile.apply(this, arguments);
    }
    if (insideMountpoint(filename_)) {
      // DONT TRANSLATE! otherwise __dirname gets real name
      return ancestor._compile.apply(this, arguments);
    }

    let filename = normalizePath(filename_);
    // console.log("_compile", filename);
    let entity = VIRTUAL_FILESYSTEM[filename];

    if (!entity) {
      // let user try to "_compile" a packaged file
      return ancestor._compile.apply(this, arguments);
    }

    let entityCode = entity[STORE_CODE];
    let entityContent = entity[STORE_CONTENT];

    if (entityCode) {
      if (entityContent) throw new Error('UNEXPECTED-45');
      let dirname = require('path').dirname(filename);
      let rqfn = makeRequireFunction.call(this);
      let args = [ this.exports, rqfn, this, filename, dirname ];
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

    let filename;

    let reqDotNode = (request.slice(-5) === '.node'); // bindings.js: opts.bindings += '.node'
    let reqLeftSlash = (request.indexOf('\\') >= 0);  // heapdump: require('../build/Release/addon')
    let reqRightSlash = (request.indexOf('/') >= 0);  // slash means that non-package is required ...
    let enable = reqDotNode || reqLeftSlash || reqRightSlash; // ... (had a problem in levelup/pouchdb)

    FLAG_DISABLE_DOT_NODE = !enable;
    try {
      filename = ancestor._resolveFilename.apply(null, arguments);
    } finally {
      FLAG_DISABLE_DOT_NODE = false;
    }

    if (!insideTheBox(filename)) {
      return filename;
    }
    if (insideMountpoint(filename)) {
      return filename;
    }

    let found = findNativeAddon(filename);
    if (found) filename = found;

    return filename;

  };

  Module._extensions['.node'] = function (module, filename_) {

    let filename = filename_;

    if (!insideTheBox(filename)) {
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

  let cluster = require('cluster');
  let ancestor = {};
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

  let childProcess = require('child_process');
  let ancestor = {};
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
      let name = arg.split('=')[0];
      return name !== '--debug-port';
    });
  }

  function makeRuntimeArgs (args) {
    let noBad = filterBadOptions(args);
    if (!noBad.length) return [];
    return [ '--runtime' ].concat(noBad);
  }

  function rearrangeFork (args) {
    let scriptPos = -1;
    for (let i = 0; i < args.length; i += 1) {
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
    let scriptPos = 0;
    if (args[scriptPos] === process.argv[1]) {
      return [].concat(
        args.slice(scriptPos + 1)
      );
    } else {
      return [].concat(args);
    }
  }

  function extractEntrypoint (args) {
    let i = args.indexOf('--entrypoint');
    if (i < 0) return null;
    return args[i + 1];
  }

  childProcess.spawn = function () {

    let args = cloneArgs(arguments);

    if ((args[0] && args[1] &&
         args[1].unshift && args[2])) {

      let callsNode = (args[0] === 'node');
      let callsExecPath = (args[0] === process.execPath);

      if (callsNode || callsExecPath) {

        if (FLAG_FORK_WAS_CALLED) {
          args[1] = rearrangeFork(args[1]);
        } else {
          args[1] = rearrangeSpawn(args[1]);
        }

        let entrypoint = extractEntrypoint(args[1]);
        if (callsNode && insideTheBox(entrypoint)) {
          // pm2 calls "node" with __dirname-based
          // thebox-script. force execPath instead of "node"
          args[0] = process.execPath;
        }

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
      "/thebox/home/igor/script.js"
    ])) === JSON.stringify([
      "--entrypoint",
      "/thebox/home/igor/script.js"
    ]));

    assert(JSON.stringify(rearrange([
      "--node-opt-01",
      "/thebox/home/igor/script.js"
    ])) === JSON.stringify([
      "--entrypoint",
      "/thebox/home/igor/script.js",
      "--runtime",
      "--node-opt-01"
    ]));

    assert(JSON.stringify(rearrange([
      "--node-opt-01",
      "--node-opt-02",
      "/thebox/home/igor/script.js"
    ])) === JSON.stringify([
      "--entrypoint",
      "/thebox/home/igor/script.js",
      "--runtime",
      "--node-opt-01",
      "--node-opt-02"
    ]));

    assert(JSON.stringify(rearrange([
      "/thebox/home/igor/script.js",
      "app-opt-01",
      "app-opt-02"
    ])) === JSON.stringify([
      "--entrypoint",
      "/thebox/home/igor/script.js",
      "app-opt-01",
      "app-opt-02"
    ]));

    assert(JSON.stringify(rearrange([
      "--node-opt-01",
      "--node-opt-02",
      "/thebox/home/igor/script.js",
      "app-opt-01",
      "app-opt-02"
    ])) === JSON.stringify([
      "--entrypoint",
      "/thebox/home/igor/script.js",
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
