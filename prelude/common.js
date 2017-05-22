'use strict';

var path = require('path');

exports.STORE_CODE = 0;
exports.STORE_CONTENT = 1;
exports.STORE_LINKS = 2;
exports.STORE_STAT = 3;
exports.ALIAS_AS_RELATIVE = 0;   // require("./file.js") // file or directory
exports.ALIAS_AS_RESOLVABLE = 1; // require("package")

function uppercaseDriveLetter (f) {
  if (f.slice(1, 3) !== ':\\') return f;
  return f[0].toUpperCase() + f.slice(1);
}

function removeTrailingSlashes (f) {
  if (f === '/') {
    return f; // dont remove from "/"
  }
  if (f.slice(1) === ':\\') {
    return f; // dont remove from "D:\"
  }
  var last = f.length - 1;
  while (true) {
    var char = f.charAt(last);
    if (char === '\\') {
      f = f.slice(0, -1);
      last -= 1;
    } else
    if (char === '/') {
      f = f.slice(0, -1);
      last -= 1;
    } else {
      break;
    }
  }
  return f;
}

function normalizePath (f) {
  var file = f;
  if (!(/^.:$/.test(f))) file = path.normalize(file); // 'c:' -> 'c:.'
  file = uppercaseDriveLetter(file);
  file = removeTrailingSlashes(file);
  return file;
}

exports.normalizePath = normalizePath;

exports.isPackageJson = function (file) {
  return path.basename(file) === 'package.json';
};

exports.isDotJS = function (file) {
  return path.extname(file) === '.js';
};

exports.isDotJSON = function (file) {
  return path.extname(file) === '.json';
};

exports.isDotNODE = function (file) {
  return path.extname(file) === '.node';
};

function replaceSlashes (file, slash) {
  if (/^.:\\/.test(file)) {
    if (slash === '/') {
      return file.slice(2).replace(/\\/g, '/');
    }
  } else
  if (/^\//.test(file)) {
    if (slash === '\\') {
      return 'C:' + file.replace(/\//g, '\\');
    }
  }
  return file;
}

function injectSnapshot (file) {
  if (/^.:\\/.test(file)) {
    // C:\path\to
    if (file.length === 3) file = file.slice(0, -1); // C:\
    return file[0] + ':\\snapshot' + file.slice(2);
  } else
  if (/^\//.test(file)) {
    // /home/user/project
    if (file.length === 1) file = file.slice(0, -1); // /
    return '/snapshot' + file;
  }
  return file;
}

exports.snapshotify = function (file, slash) {
  var f = normalizePath(file);
  return injectSnapshot(replaceSlashes(f, slash));
};

var win32 = process.platform === 'win32';

if (win32) {
  exports.insideSnapshot = function insideSnapshot (f) {
    if (typeof f !== 'string') return false;
    var slice112 = f.slice(1, 12);
    if (slice112 === ':\\snapshot\\' ||
        slice112 === ':\\snapshot') return true;
    return false;
  };
} else {
  exports.insideSnapshot = function insideSnapshot (f) {
    if (typeof f !== 'string') return false;
    var slice010 = f.slice(0, 10);
    if (slice010 === '/snapshot/' ||
        slice010 === '/snapshot') return true;
    return false;
  };
}

exports.stripSnapshot = function (f) {
  var file = normalizePath(f);
  if (/^.:\\snapshot$/.test(file)) {
    return file[0] + ':\\';
  }
  if (/^.:\\snapshot\\/.test(file)) {
    return file[0] + ':' + file.slice(11);
  }
  if (/^\/snapshot$/.test(file)) {
    return '/';
  }
  if (/^\/snapshot\//.test(file)) {
    return file.slice(9);
  }
  return f; // not inside
};
