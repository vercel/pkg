'use strict';

var assert = require('assert');
var path = require('path');

exports.STORE_BLOB = 0;
exports.STORE_CONTENT = 1;
exports.STORE_LINKS = 2;
exports.STORE_STAT = 3;
exports.ALIAS_AS_RELATIVE = 0;   // require("./file.js") // file or directory
exports.ALIAS_AS_RESOLVABLE = 1; // require("package")

var win32 = process.platform === 'win32';
var hasURL = typeof URL !== 'undefined';

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

function isRootPath (p) {
  if (Buffer.isBuffer(p)) p = p.toString();
  if (hasURL && p instanceof URL) p = p.pathname;
  if (p === '.') p = path.resolve(p);
  return path.dirname(p) === p;
}

exports.isRootPath = isRootPath;

var normalizePath;

if (win32) {
  normalizePath = function (f) {
    var file = f;
    if (Buffer.isBuffer(file)) file = file.toString();
    if (hasURL && file instanceof URL) file = file.pathname.replace(/^\//, '');
    if (!(/^.:$/.test(file))) file = path.normalize(file); // 'c:' -> 'c:.'
    file = uppercaseDriveLetter(file);
    file = removeTrailingSlashes(file);
    return file;
  };
} else {
  normalizePath = function (f) {
    var file = f;
    if (Buffer.isBuffer(file)) file = file.toString();
    if (hasURL && file instanceof URL) file = file.pathname;
    if (!(/^.:$/.test(file))) file = path.normalize(file); // 'c:' -> 'c:.'
    file = removeTrailingSlashes(file);
    return file;
  };
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

function longestCommonLength (s1, s2) {
  var length = Math.min(s1.length, s2.length);
  for (var i = 0; i < length; i += 1) {
    if (s1.charCodeAt(i) !== s2.charCodeAt(i)) {
      return i;
    }
  }
  return length;
}

function withoutNodeModules (file) {
  return file.split(path.sep + 'node_modules' + path.sep)[0];
}

exports.retrieveDenominator = function (files) {
  assert(files.length > 0);

  var s1 = withoutNodeModules(files[0]) + path.sep;
  for (var i = 1; i < files.length; i += 1) {
    var s2 = withoutNodeModules(files[i]) + path.sep;
    s1 = s1.slice(0, longestCommonLength(s1, s2));
  }

  if (s1 === '') return win32 ? 2 : 0;
  return s1.lastIndexOf(path.sep);
};

exports.substituteDenominator = function (f, denominator) {
  var rootLength = win32 ? 2 : 0;
  return f.slice(0, rootLength) + f.slice(denominator);
};

exports.snapshotify = function (file, slash) {
  assert.strictEqual(file, normalizePath(file));
  return injectSnapshot(replaceSlashes(file, slash));
};

if (win32) {
  exports.insideSnapshot = function insideSnapshot (f) {
    if (Buffer.isBuffer(f)) f = f.toString();
    if (hasURL && f instanceof URL) f = f.pathname.replace(/^\//, '');
    if (typeof f !== 'string') return false;
    var slice112 = f.slice(1, 12);
    if (slice112 === ':\\snapshot\\' ||
        slice112 === ':/snapshot\\' ||
        slice112 === ':\\snapshot/' ||
        slice112 === ':/snapshot/' ||
        slice112 === ':\\snapshot' ||
        slice112 === ':/snapshot') return true;
    return false;
  };
} else {
  exports.insideSnapshot = function insideSnapshot (f) {
    if (Buffer.isBuffer(f)) f = f.toString();
    if (hasURL && f instanceof URL) f = f.pathname;
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
    return file[0] + ':\\**\\';
  }
  if (/^.:\\snapshot\\/.test(file)) {
    return file[0] + ':\\**' + file.slice(11);
  }
  if (/^\/snapshot$/.test(file)) {
    return '/**/';
  }
  if (/^\/snapshot\//.test(file)) {
    return '/**' + file.slice(9);
  }
  return f; // not inside
};

if (win32) {
  exports.removeUplevels = function removeUplevels (f) {
    while (true) {
      if (f.slice(0, 3) === '..\\') {
        f = f.slice(3);
      } else
      if (f === '..') {
        f = '.';
      } else {
        break;
      }
    }
    return f;
  };
} else {
  exports.removeUplevels = function removeUplevels (f) {
    while (true) {
      if (f.slice(0, 3) === '../') {
        f = f.slice(3);
      } else
      if (f === '..') {
        f = '.';
      } else {
        break;
      }
    }
    return f;
  };
}
