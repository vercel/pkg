/* eslint-enable no-param-reassign */

'use strict';

let path = require('path');

exports.STORE_CODE = 0;
exports.STORE_CONTENT = 1;
exports.STORE_LINKS = 2;
exports.STORE_STAT = 3;
exports.ALIAS_AS_RELATIVE = 0;   // require("./file.js") // file or directory
exports.ALIAS_AS_RESOLVABLE = 1; // require("package")

function uppercaseDriveLetter (f) {
  let file = f;
  if (file.slice(1, 3) === ':\\') {
    let fs01 = file.slice(0, 1);
    file = fs01.toUpperCase() + file.slice(1);
  }
  return file;
}

function removeTrailingSlashes (f) {
  let file = f;
  if (file === '/') {
    return file; // dont remove from "/"
  }
  if (file.slice(1) === ':\\') {
    return file; // dont remove from "d:\\"
  }
  while (true) {
    let s = file.slice(-1);
    if (s === '\\') {
      file = file.slice(0, -1);
    } else
    if (s === '/') {
      file = file.slice(0, -1);
    } else {
      break;
    }
  }
  return file;
}

function normalizePath (f) {
  let file = f;
  file = path.normalize(file);
  file = uppercaseDriveLetter(file);
  file = removeTrailingSlashes(file);
  return file;
}

exports.normalizePath = normalizePath;

exports.isPackageJson = function (file) {
  return path.basename(file) === 'package.json';
};

exports.isDotJS = function (file) {
  // exceljs/lib/xlsx/.rels
  // http-server/bin/http-server
  return (path.basename(file).indexOf('.') < 0) ||
         (path.extname(file) === '.js');
};

exports.isDotJSON = function (file) {
  return path.extname(file) === '.json';
};

exports.isDotNODE = function (file) {
  return path.extname(file) === '.node';
};

exports.theboxify = function (file) {
  if (file.slice(1, 3) === ':\\') {
    // C:\path\to
    return file.slice(0, 2) +
           file.slice(2, 3) + 'thebox' +
           file.slice(2);
  } else
  if (file.slice(0, 1) === '/') {
    // /home/user/project
    return file.slice(0, 1) + 'thebox' +
           file.slice(0);
  } else {
    return file;
  }
};

function insideTheBox (f) {
  if (typeof f !== 'string') return false;
  let file = normalizePath(f);
  return (file.slice(2, 10) === '\\thebox\\') ||
         (file.slice(0, 8) === '/thebox/');
}

exports.insideTheBox = insideTheBox;

exports.stripTheBox = function (f) {
  if (!insideTheBox(f)) return f;
  let file = normalizePath(f);
  if (file.slice(2, 10) === '\\thebox\\') {
    return file.slice(0, 2) + file.slice(9);
  } else {
    return file.slice(7);
  }
};
